const NOCODB_URL = process.env.NEXT_PUBLIC_NOCODB_URL!;
const TOKEN = process.env.NOCODB_API_TOKEN!;
const TABLE_ID = 'm3pehyuo16yte7j';

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId');
  
  const response = await fetch(
    `${NOCODB_URL}/tables/${TABLE_ID}/records?where=(student_id,eq,${studentId})`,
    { headers: { 'xc-token': TOKEN } }
  );

  const data = await response.json();
  return NextResponse.json({ logs: data.list || [] });
}

export async function POST(req: NextRequest) {
  const { student_id, workout_id, exercise_id, completed, date } = await req.json();
  
  // Buscar existente
  const where = `(student_id,eq,${student_id})~and(workout_id,eq,${workout_id})~and(exercise_id,eq,${exercise_id})~and(date,eq,${date})`;
  const existingRes = await fetch(
    `${NOCODB_URL}/tables/${TABLE_ID}/records?where=${where}`,
    { headers: { 'xc-token': TOKEN } }
  );
  
  const existing = await existingRes.json();
  const existingLogs = existing.list || [];
  
  if (completed) {
    if (existingLogs.length > 0) {
      return NextResponse.json({ success: true });
    }
    
    await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
      body: JSON.stringify({ student_id, workout_id, exercise_id, completed: true, date }),
    });
    
    return NextResponse.json({ success: true });
  } else {
    if (existingLogs.length === 0) {
      return NextResponse.json({ success: true });
    }
    
    for (const log of existingLogs) {
      await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
        body: JSON.stringify([{ id: log.id }]),
      });
    }
    
    return NextResponse.json({ success: true });
  }
}
