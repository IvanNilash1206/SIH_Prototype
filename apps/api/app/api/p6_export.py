from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.domain import Project, Activity, WBSNode, PlantUnit
from datetime import datetime

router = APIRouter()

@router.get("/export/xer")
def export_primavera_p6_xer(db: Session = Depends(get_db)):
    """
    Generates a standard Oracle Primavera P6 .XER export file
    incorporating live baseline vs actual progress, WBS nodes, and activities.
    """
    project = db.query(Project).first()
    proj_code = project.code if project else "CDU-EXP-02"
    proj_name = project.name if project else "CDU Capacity Expansion — Unit 2"
    
    activities = db.query(Activity).all()
    wbs_nodes = db.query(WBSNode).all()

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M")
    
    # Build P6 .XER Header & Tables
    lines = [
        "ERMHDR\t8.0\t2026-08-28\tDATABASE\tSYNCHROLINK_AI\tPrimavera P6 Professional\tUSD",
        "%T\tPROJECT",
        "%F\tproj_id\tproj_short_name\tproj_title\tstatus_code\tplan_start_date\tplan_end_date\tdef_cost_qty_type",
        f"%R\t1001\t{proj_code}\t{proj_name}\tPS_Open\t2026-01-01 08:00\t2026-12-31 17:00\tCQ_AutoCalc",
        "%T\tPROJWBS",
        "%F\twbs_id\tproj_id\tparent_wbs_id\twbs_short_name\twbs_name\tseq_num",
        f"%R\t2001\t1001\t\tL1\tEngineering, Procurement & Construction\t1"
    ]

    for idx, wbs in enumerate(wbs_nodes):
        lines.append(f"%R\t{3000 + idx}\t1001\t2001\t{wbs.code}\t{wbs.name}\t{idx + 2}")

    lines.append("%T\tTASK")
    lines.append("%F\ttask_id\tproj_id\twbs_id\ttask_code\ttask_name\tstatus_code\ttarget_drtn_hr_cnt\tact_work_qty\ttarget_work_qty\tphys_complete_pct\ttarget_start_date\ttarget_end_date")

    for idx, act in enumerate(activities):
        status_code = "TK_Complete" if act.actual_progress >= 100 else ("TK_Active" if act.actual_progress > 0 else "TK_NotStart")
        start_str = act.planned_start.strftime("%Y-%m-%d 08:00") if act.planned_start else "2026-06-01 08:00"
        finish_str = act.planned_finish.strftime("%Y-%m-%d 17:00") if act.planned_finish else "2026-08-30 17:00"
        
        lines.append(
            f"%R\t{5000 + idx}\t1001\t2001\t{act.activity_code}\t{act.name}\t{status_code}\t160.0\t{act.actual_progress}\t100.0\t{act.actual_progress}\t{start_str}\t{finish_str}"
        )

    lines.append("%E\tEnd of Export")
    xer_content = "\n".join(lines)

    filename = f"{proj_code}_SynchroLink_Sync.xer"
    return Response(
        content=xer_content,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/export/xml")
def export_ms_project_xml(db: Session = Depends(get_db)):
    """
    Generates a Microsoft Project Standard XML schedule export.
    """
    project = db.query(Project).first()
    proj_code = project.code if project else "CDU-EXP-02"
    proj_name = project.name if project else "CDU Capacity Expansion — Unit 2"
    activities = db.query(Activity).all()

    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
        '<Project xmlns="http://schemas.microsoft.com/project">',
        f'  <Name>{proj_name}</Name>',
        f'  <Title>{proj_code}</Title>',
        f'  <CreationDate>{datetime.utcnow().isoformat()}</CreationDate>',
        '  <Tasks>'
    ]

    for idx, act in enumerate(activities):
        xml_lines.extend([
            '    <Task>',
            f'      <UID>{idx + 1}</UID>',
            f'      <ID>{idx + 1}</ID>',
            f'      <Name>{act.name}</Name>',
            f'      <WBS>{act.activity_code}</WBS>',
            f'      <PercentComplete>{int(act.actual_progress)}</PercentComplete>',
            f'      <Start>{act.planned_start.isoformat() if act.planned_start else "2026-06-01T08:00:00"}</Start>',
            f'      <Finish>{act.planned_finish.isoformat() if act.planned_finish else "2026-08-30T17:00:00"}</Finish>',
            '    </Task>'
        ])

    xml_lines.extend([
        '  </Tasks>',
        '</Project>'
    ])

    xml_content = "\n".join(xml_lines)
    filename = f"{proj_code}_MSProject.xml"
    return Response(
        content=xml_content,
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
