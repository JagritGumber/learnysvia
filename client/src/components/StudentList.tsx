interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
}

interface StudentListProps {
  students: User[];
  onStudentClick: (student: User) => void;
}

export function StudentList({ students, onStudentClick }: StudentListProps) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <h2 className="card-title">Students</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {students.length === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm">No students found</p>
            </div>
          ) : (
            students.map(student => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 cursor-pointer transition-colors"
                onClick={() => onStudentClick(student)}
              >
                <div className="avatar">
                  <div className="w-10 rounded-full">
                    {student.image ? (
                      <img src={student.image} alt={student.name} />
                    ) : (
                      <div className="bg-primary text-primary-content flex items-center justify-center text-sm font-semibold">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{student.name}</div>
                  <div className="text-sm text-base-content/60 truncate">
                    {student.email}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
