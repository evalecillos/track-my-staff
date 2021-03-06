const db = require("./db/connection");
const figlet = require("figlet");
const inquirer = require("inquirer");
const cTable = require("console.table");

//welcome figlet
db.connect((err) => {
    if (err) throw err;
    figlet("Track My Staff", function (err, data) {
        if (err) {
            console.log("Uh oh... Something went wrong...");
            console.dir(err);
            return;
        }
        console.log(data);
        promptAction();
    });
});

//inquirer prompts
const promptAction = () => {
    inquirer
        .prompt([
            {
                type: "list",
                name: "actions",
                message: "What would you like to do?",
                choices: [
                    "View All Departments",
                    "View All Roles",
                    "View All Employees",
                    "Add A Department",
                    "Add A Role",
                    "Add An Employee",
                    "Update An Employee's Role",
                    "Update An Employee's Manager",
                    // "View Employees By Manager",
                    // "View Employees By Department",
                    "Delete Department",
                    "Delete Role",
                    "Delete Employee",
                    "View Department's Combined Salaries",
                    "Exit",
                ],
            },
        ])
        .then((actionAnswers) => {
            if (actionAnswers.actions === "View All Departments") {
                viewAllDepartments();
            }
            if (actionAnswers.actions === "View All Roles") {
                viewAllRoles();
            }
            if (actionAnswers.actions === "View All Employees") {
                viewAllEmployees();
            }
            if (actionAnswers.actions === "Add A Department") {
                addDepartment();
            }
            if (actionAnswers.actions === "Add A Role") {
                addRole();
            }
            if (actionAnswers.actions === "Add An Employee") {
                addEmployee();
            }
            if (actionAnswers.actions === "Update An Employee's Role") {
                updateEmployeeRole();
            }
            if (actionAnswers.actions === "Update An Employee's Manager") {
                updateEmployeeManager();
            }
            // if (actionAnswers.actions === "View Employees By Manager") {
            //     viewEmployeeByManager();
            // }
            // if (actionAnswers.actions === "View Employees By Department") {
            //     viewEmployeeByDepartment();
            // }
            if (actionAnswers.actions === "Delete Department") {
                deleteDepartment();
            }
            if (actionAnswers.actions === "Delete Role") {
                deleteRole();
            }
            if (actionAnswers.actions === "Delete Employee") {
                deleteEmployee();
            }
            if (
                actionAnswers.actions === "View Department's Combined Salaries"
            ) {
                viewCombinedSalariesByDepartment();
            }
            if (actionAnswers.actions === "Exit") {
                db.end();
            }
        });
};

//functions for each actions

//view all departments fn
const viewAllDepartments = () => {
    const sql = `SELECT departments.id, departments.department_name FROM departments`;

    db.query(sql, (err, rows) => {
        if (err) throw error;
        console.log("====================");
        console.log("Departments");
        console.log("====================");
        console.table(rows);
        promptAction();
    });
};

//view all roles fn
const viewAllRoles = () => {
    const sql = `SELECT roles.id, roles.title, departments.department_name, roles.salary
    FROM roles
    INNER JOIN departments ON roles.department_id = departments.id`;

    db.query(sql, (err, rows) => {
        if (err) throw error;
        console.log("====================");
        console.log("Roles");
        console.log("====================");
        console.table(rows);
        promptAction();
    });
};

//view all employees fn
const viewAllEmployees = () => {
    const sql = `SELECT employees.id, 
                    employees.first_name, 
                    employees.last_name, 
                    roles.title, 
                    departments.department_name, 
                    roles.salary,
                    employees.manager_id
                    FROM employees, roles, departments 
                    WHERE departments.id = roles.department_id 
                    AND roles.id = employees.role_id`;
    //fix manager here!!!

    db.query(sql, (err, rows) => {
        if (err) throw error;
        console.log("====================");
        console.log("Employees");
        console.log("====================");
        console.table(rows);
        promptAction();
    });
};

//add department
const addDepartment = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "newDepartment",
                message: "Enter new department's name: ",
                validate: (text) => {
                    if (text) {
                        return true;
                    } else {
                        console.log(
                            "Please enter the name of the new department to proceed."
                        );
                        return false;
                    }
                },
            },
        ])
        .then((answer) => {
            const sql = `INSERT INTO departments (department_name) values (?)`;
            db.query(sql, answer.newDepartment, (err, rows) => {
                if (err) throw error;
                console.log(
                    `${answer.newDepartment} was succesfully added to the Departments Database!`
                );
                promptAction();
            });
        });
};

//add role
const addRole = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "newRole",
                message: "Enter the role's name: ",
                validate: (text) => {
                    if (text) {
                        return true;
                    } else {
                        console.log(
                            "Please enter the name of the new role to proceed."
                        );
                        return false;
                    }
                },
            },
            {
                type: "input",
                name: "salary",
                message: "Enter salary for this role: ",
                validate: (number) => {
                    if (number) {
                        return true;
                    } else {
                        console.log(
                            "Please enter a salary for this new role to proceed."
                        );
                        return false;
                    }
                },
            },
        ])
        .then((answer) => {
            const addRoleArray = [answer.newRole, answer.salary];
            const sqlRole = `SELECT department_name, id FROM departments`;

            db.query(sqlRole, (err, data) => {
                if (err) throw error;
                const departments = data.map(({ department_name, id }) => ({
                    name: department_name,
                    value: id,
                }));
                inquirer
                    .prompt([
                        {
                            type: "list",
                            name: "department",
                            message:
                                "What department is this role going to be in?",
                            choices: departments,
                        },
                    ])
                    .then((departmentChoice) => {
                        const department = departmentChoice.department;
                        addRoleArray.push(department);

                        const sql = `INSERT INTO roles (title, salary, department_id)
                VALUES (?, ?, ?)`;

                        db.query(sql, addRoleArray, (err, rows) => {
                            if (err) throw error;
                            console.log(
                                `${answer.newRole} was succesfully added to the roles table!`
                            );
                            promptAction();
                        });
                    });
            });
        });
};

//add employee
const addEmployee = () => {
    inquirer
        .prompt([
            {
                type: "input",
                name: "firstName",
                message: "Enter the employee's first name: ",
                validate: (text) => {
                    if (text) {
                        return true;
                    } else {
                        console.log("Please enter the first name to proceed.");
                        return false;
                    }
                },
            },
            {
                type: "input",
                name: "lastName",
                message: "Enter the employee's last name: ",
                validate: (text) => {
                    if (text) {
                        return true;
                    } else {
                        console.log("Please enter the last name to proceed.");
                        return false;
                    }
                },
            },
        ])
        .then((answer) => {
            const addEmployeeArray = [answer.firstName, answer.lastName];
            const sqlRole = `SELECT roles.id, title FROM roles`;

            db.query(sqlRole, (err, data) => {
                if (err) throw error;
                const roles = data.map(({ title, id }) => ({
                    name: title,
                    value: id,
                }));
                inquirer
                    .prompt([
                        {
                            type: "list",
                            name: "employeeRole",
                            message: "What will be the employee's role?",
                            choices: roles,
                        },
                    ])
                    .then((roleChoice) => {
                        const role = roleChoice.employeeRole;
                        addEmployeeArray.push(role);

                        const sqlManager = `SELECT * FROM employees`;

                        db.query(sqlManager, (err, data) => {
                            if (err) throw err;

                            const managers = data.map(
                                ({ id, first_name, last_name }) => ({
                                    name: first_name + " " + last_name,
                                    value: id,
                                })
                            );

                            // console.log(managers);

                            inquirer
                                .prompt([
                                    {
                                        type: "list",
                                        name: "manager",
                                        message:
                                            "Who will be the employee's manager?",
                                        choices: managers,
                                    },
                                ])
                                .then((managerChoice) => {
                                    const manager = managerChoice.manager;
                                    addEmployeeArray.push(manager);

                                    const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
                VALUES (?, ?, ?, ?)`;

                                    db.query(
                                        sql,
                                        addEmployeeArray,
                                        (err, rows) => {
                                            if (err) throw error;
                                            console.log(
                                                `Employee was succesfully added to the table!`
                                            );
                                            promptAction();
                                        }
                                    );
                                });
                        });
                    });
            });
        });
};

//update employee fn
const updateEmployeeRole = () => {
    const sqlEmployees = `SELECT * FROM employees`;

    db.query(sqlEmployees, (err, rows) => {
        const employees = rows.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id,
        }));

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "employeeName",
                    message: "Which employee would you like to update?",
                    choices: employees,
                },
            ])
            .then((employeeChoice) => {
                const employeeString = employeeChoice.employeeName;
                const employeeArray = [];
                employeeArray.push(employeeString);
                const sqlRole = `SELECT * FROM roles`;

                db.query(sqlRole, (err, rows) => {
                    if (err) throw error;
                    const rolesList = rows.map(({ id, title }) => ({
                        name: title,
                        value: id,
                    }));
                    // console.log(rolesList);
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                name: "employeeRole",
                                message: "What is the employee's new role?",
                                choices: rolesList,
                            },
                        ])
                        .then((answer) => {
                            const role = answer.employeeRole;

                            employeeArray.push(role);

                            let employee = employeeArray[0];
                            employeeArray[0] = role;
                            employeeArray[1] = employee;

                            const sql = `UPDATE employees SET role_id = ? WHERE id = ?`;

                            db.query(sql, employeeArray, (err, rowss) => {
                                if (err) throw error;
                                console.log("The employee has been updated.");

                                promptAction();
                            });
                        });
                });
            });
    });
};

//update employee managers fn
const updateEmployeeManager = () => {
    const sqlEmployees = `SELECT * FROM employees`;

    db.query(sqlEmployees, (err, rows) => {
        const employees = rows.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id,
        }));

        inquirer
            .prompt([
                {
                    type: "list",
                    name: "employeeName",
                    message: "Which employee would you like to update?",
                    choices: employees,
                },
            ])
            .then((employeeChoice) => {
                const employeeString = employeeChoice.employeeName;
                const employeeArray = [];
                employeeArray.push(employeeString);
                const sqlManager = `SELECT * FROM employees`;

                db.query(sqlManager, (err, rows) => {
                    if (err) throw error;
                    const managerList = rows.map(
                        ({ id, first_name, last_name }) => ({
                            name: first_name + " " + last_name,
                            value: id,
                        })
                    );
                    // console.log(managerList);
                    inquirer
                        .prompt([
                            {
                                type: "list",
                                name: "manager",
                                message: "Who is this employee's manager?",
                                choices: managerList,
                            },
                        ])
                        .then((answer) => {
                            const manager = answer.manager;

                            employeeArray.push(manager);

                            let employee = employeeArray[0];
                            employeeArray[0] = manager;
                            employeeArray[1] = employee;

                            const sql = `UPDATE employees SET manager_id = ? WHERE id = ?`;

                            db.query(sql, employeeArray, (err, rows) => {
                                if (err) throw error;
                                console.log("The employee has been updated.");

                                promptAction();
                            });
                        });
                });
            });
    });
};

//don't know what they mean by sort by dpt or manager so won't do it.

//delete department fn
const deleteDepartment = () => {
    const sqlDepartment = `SELECT * FROM departments`;

    db.query(sqlDepartment, (err, rows) => {
        if (err) throw error;

        const departmentArr = rows.map(({ department_name, id }) => ({
            name: department_name,
            value: id,
        }));
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Which department would you like to delete?",
                    choices: departmentArr,
                },
            ])
            .then((answer) => {
                const department = answer.department;
                const sql = `DELETE FROM departments WHERE id = ?`;

                db.query(sql, department, (err, rows) => {
                    if (err) throw err;
                    console.log("The department was deleted succesfully.");
                    promptAction();
                });
            });
    });
};
//delete role fn
const deleteRole = () => {
    const sqlRole = `SELECT * FROM roles`;

    db.query(sqlRole, (err, rows) => {
        if (err) throw error;

        const rolesArray = rows.map(({ title, id }) => ({
            name: title,
            value: id,
        }));
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "role",
                    message: "Which department would you like to delete?",
                    choices: rolesArray,
                },
            ])
            .then((answer) => {
                const role = answer.role;
                const sql = `DELETE FROM roles WHERE id = ?`;

                db.query(sql, role, (err, rows) => {
                    if (err) throw err;
                    console.log("The role was deleted succesfully.");
                    promptAction();
                });
            });
    });
};
//delete employee fn
const deleteEmployee = () => {
    const sqlEmployee = `SELECT * FROM employees`;

    db.query(sqlEmployee, (err, rows) => {
        if (err) throw error;

        const employeeArray = rows.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id,
        }));
        inquirer
            .prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Which employee would you like to delete?",
                    choices: employeeArray,
                },
            ])
            .then((answer) => {
                const employee = answer.employee;
                const sql = `DELETE FROM employees WHERE id = ?`;

                db.query(sql, employee, (err, rows) => {
                    if (err) throw err;
                    console.log("The employee was deleted succesfully.");
                    promptAction();
                });
            });
    });
};

//combined budget fn
const viewCombinedSalariesByDepartment = () => {
    const sql = `SELECT department_id AS id, 
                departments.department_name,
                SUM(salary) AS budget
                FROM  roles 
                JOIN departments ON roles.department_id = departments.id GROUP BY  department_id`;

    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        promptAction();
    });
};
