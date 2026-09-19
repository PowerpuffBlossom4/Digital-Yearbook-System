import { CoverLayout } from "./layouts/CoverLayout";
import { PrincipalLayout } from "./layouts/PrincipalLayout";
import { FacultyLayout } from "./layouts/FacultyLayout";
import { DeanLayout } from "./layouts/DeanLayout";
import { DepartmentLayout } from "./layouts/DepartmentLayout";
import { ProgramLayout } from "./layouts/ProgramLayout";
import { StudentLayout } from "./layouts/StudentLayout";
import { MemoriesLayout } from "./layouts/MemoriesLayout";
import { ClosingLayout } from "./layouts/ClosingLayout";
import { BackCoverLayout } from "./layouts/BackCoverLayout";


export function SPCStyle() {

    const baseId = Date.now();

    return [

        // =====================================
        // 1. FRONT COVER
        // =====================================

        {
            id: baseId + 1,
            title: "Cover",
            type: "cover",
            json: CoverLayout(),
        },

        // =====================================
        // 2. PRINCIPAL MESSAGE
        // =====================================

        {
            id: baseId + 2,
            title: "Principal Message",
            type: "principal",
            json: PrincipalLayout(),
        },

        // =====================================
        // 3. DEAN MESSAGES
        // =====================================

        {
            id: baseId + 3,
            title: "Dean Messages",
            type: "dean-section",
            dynamic: true,
            json: DeanLayout(),
        },

        // =====================================
        // 4. FACULTY PAGES
        // =====================================

        {
            id: baseId + 4,
            title: "Faculty Pages",
            type: "faculty-section",
            dynamic: true,
            json: FacultyLayout(),
        },

        // =====================================
        // 5. DEPARTMENT
        // =====================================

        {
            id: baseId + 5,
            title: "Department",
            type: "department-section",
            dynamic: true,

            /*
                Example

                Department of Computing
                Department of Engineering
                Department of Agriculture

                Department Chairperson's Message
            */

            json: DepartmentLayout(),
        },

        // =====================================
        // 6. PROGRAM
        // =====================================

        {
            id: baseId + 6,
            title: "Program",
            type: "program-section",
            dynamic: true,

            /*
                Example

                BS Information Technology
                BS Information System
                BS Agriculture
                BS Civil Engineering

                Program Chairperson's Message
            */

            json: ProgramLayout(),
        },

        // =====================================
        // 7. STUDENT PAGES
        // =====================================

{
    id: baseId + 7,
    title: "Student Pages",
    type: "student-section",
    dynamic: true,
    json: StudentLayout(),
},

        // =====================================
        // 8. MEMORIES
        // =====================================

        {
            id: baseId + 8,
            title: "Memories",
            type: "memories",
            json: MemoriesLayout(),
        },

        // =====================================
        // 9. CLOSING
        // =====================================

        {
            id: baseId + 9,
            title: "Closing",
            type: "closing",
            json: ClosingLayout(),
        },

        // =====================================
        // 10. BACK COVER
        // =====================================

        {
            id: baseId + 10,
            title: "Back Cover",
            type: "back-cover",
            json: BackCoverLayout(),
        },

    ];

}