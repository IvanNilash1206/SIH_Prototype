import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.models.database import engine, Base, SessionLocal
from app.models.domain import Project, PlantUnit, WBSNode, Activity, generate_uuid
import random
from datetime import datetime, timedelta

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)

def seed_data(db: Session):
    print("Seeding data...")
    # Create Project
    project = Project(
        name="CDU Capacity Expansion — Unit 2",
        code="CDU-EXP-02",
        description="Expansion of Crude Distillation Unit 2 to increase throughput."
    )
    db.add(project)
    db.commit()

    # Create Plant Units
    units = ["CDU-01", "CDU-02", "CDU-03", "TANK-FARM", "UTILITIES", "CONTROL-ROOM"]
    unit_map = {}
    for code in units:
        pu = PlantUnit(project_id=project.id, code=code, name=f"{code} Area")
        db.add(pu)
        db.commit()
        unit_map[code] = pu

    # WBS Nodes
    wbs_root = WBSNode(project_id=project.id, code="L1", name="Engineering, Procurement & Construction", level=1)
    db.add(wbs_root)
    db.commit()
    
    disciplines = ["Civil", "Mechanical", "Piping", "Electrical", "Instrumentation"]
    wbs_map = {}
    
    for d in disciplines:
        wbs_d = WBSNode(project_id=project.id, parent_id=wbs_root.id, code=f"L2-{d[:3].upper()}", name=d, level=2)
        db.add(wbs_d)
        db.commit()
        wbs_map[d] = wbs_d

    # Assets
    assets = ["P-201", "P-202", "P-203", "P-204", "P-205", "V-101", "V-102", "V-103", "HX-201", "HX-202", "TK-301", "TK-302"]
    
    actions = {
        "Civil": ["Foundation Preparation", "Formwork", "Rebar Installation", "Concrete Pouring", "Curing"],
        "Mechanical": ["Equipment Setting", "Alignment", "Mechanical Installation", "Grouting", "Testing", "Commissioning"],
        "Piping": ["Spool Erection", "Welding", "NDT", "Hydrotesting", "Insulation"],
        "Electrical": ["Cable Tray Installation", "Cable Pulling", "Termination", "Loop Checking"],
        "Instrumentation": ["Instrument Calibration", "Mounting", "Tubing", "Loop Testing"]
    }

    start_date = datetime.utcnow() - timedelta(days=30)
    
    # Insert Golden Activities
    cdu2 = unit_map["CDU-02"]
    mech_wbs = wbs_map["Mechanical"]
    
    golden_activities = [
        ("MECH-CDU2-P204-001", "P-204 Foundation Preparation", 100.0, "COMPLETED"),
        ("MECH-CDU2-P204-002", "P-204 Mechanical Installation", 72.0, "IN_PROGRESS"),
        ("MECH-CDU2-P204-003", "P-204 Alignment", 0.0, "PLANNED"),
        ("MECH-CDU2-P204-004", "P-204 Testing", 0.0, "PLANNED"),
        ("MECH-CDU2-P204-005", "P-204 Commissioning", 0.0, "PLANNED")
    ]
    
    for idx, (code, name, progress, status) in enumerate(golden_activities):
        db.add(Activity(
            project_id=project.id,
            wbs_node_id=mech_wbs.id,
            activity_code=code,
            name=name,
            discipline="Mechanical",
            plant_unit_id=cdu2.id,
            area="Pump Area",
            asset_id="P-204",
            planned_start=start_date + timedelta(days=idx*3),
            planned_finish=start_date + timedelta(days=(idx+1)*3),
            baseline_progress=progress,
            actual_progress=progress,
            status=status
        ))
    db.commit()

    # Generate additional activities for volume (around 200 total)
    for i in range(200):
        d = random.choice(disciplines)
        u_code = random.choice(units)
        asset = random.choice(assets)
        action = random.choice(actions[d])
        act_code = f"{d[:4].upper()}-{u_code.replace('-','')}-{asset}-{str(i).zfill(3)}"
        
        # ensure uniqueness
        existing = db.query(Activity).filter(Activity.activity_code == act_code).first()
        if existing:
            continue
            
        progress = random.choice([0.0, random.uniform(10, 90), 100.0])
        status = "COMPLETED" if progress == 100 else ("IN_PROGRESS" if progress > 0 else "PLANNED")
        
        db.add(Activity(
            project_id=project.id,
            wbs_node_id=wbs_map[d].id,
            activity_code=act_code,
            name=f"{asset} {action}",
            discipline=d,
            plant_unit_id=unit_map[u_code].id,
            asset_id=asset,
            planned_start=start_date + timedelta(days=random.randint(-10, 30)),
            planned_finish=start_date + timedelta(days=random.randint(31, 60)),
            actual_progress=round(progress, 1),
            status=status
        ))
        
    db.commit()
    count = db.query(Activity).count()
    print(f"Successfully seeded {count} activities.")

if __name__ == "__main__":
    reset_db()
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
