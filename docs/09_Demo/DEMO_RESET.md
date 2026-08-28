# Demo Reset Procedure

The application must provide a reliable way to restore demo state.

Preferred options: - `/api/demo/reset`; - admin-only reset action; -
seed command.

Reset should: 1. restore baseline activity progress; 2. clear demo
reports; 3. clear demo reviews; 4. clear demo delay events; 5. restore
audit state; 6. preserve the seeded schedule.

The reset action must be clearly labeled as a demo/development operation
and disabled or protected in production mode.
