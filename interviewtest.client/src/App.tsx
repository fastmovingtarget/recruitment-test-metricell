import { useEffect, useState } from 'react';
import Employee from './Employee';
import EmployeeForm from './EmployeeForm/EmployeeForm';
import "./App.css"

function App() {
    const [loading, setLoading] = useState<boolean>(true);//flags for the UI that a process has begun but not completed
    const [databaseChanged, setDatabaseChanged] = useState<boolean>(true)//Flags that the database has been changed and another get needs to be submitted
    const [employees, setEmployees] = useState<Employee[]>([]);//employees starts off blank and is then initially populated (hopefully) in checkConnectivity
    const [editIndex, setEditIndex] = useState<number>(-1);//the index of the employee entry that's being edited. -1 indicates that nothing is being edited.
    const [mathsData, setMathsData] = useState<number>(0);//the total value of all employees with first initials A-C

    useEffect(() => {
        if(databaseChanged)
            checkConnectivity();
    }, [databaseChanged]);

    return (
        <div className={"container-div " + (loading ? "loading " : "")}>
            <div className="app-container">
                <div className="connectivity-container">Connectivity check: {employees.length > 0 && !loading ? `OK (${employees.length})` : `NOT READY`}</div>
                <div className="introduction">Complete your app here</div>
                {/*<div>Thanks, I will!</div>
                simple unordered list mapping the employee data which we got with checkConnectivity*/}
                <div>
                    <div className="maths-container column">
                        <button className="button-of-value" onClick={() => pushTheButton()}>Increment Value</button>
                        <p>{mathsData >= 11171 ? "Values of employees with initials A, B and C: " + mathsData : null /* check if above 11171, don't display if it isn't */ }</p> 
                    </div>
                    <EmployeeForm employee={{name:"", value:0}} submitEmployeeData={addNewEmployee}/>
                    <div className="employees-container">
                        <div className="header-container row"><span>Name</span><span>Value</span></div>
                        {employees.map((employee, index) => (
                            editIndex === index ? 
                            <EmployeeForm employee={employee} submitEmployeeData={changeExistingEmployee} key={"employee-form-" + index} cancelHandler={() => setEditIndex(-1)}/> :
                            <div key={"employee-" + index} className="employee-container row">
                                <span>{employee.name}</span><span>{employee.value}</span> 
                                <button className="employee-button" onClick={() => setEditIndex(index)} > Edit </button>
                                <button className="employee-button" onClick={() => deleteExistingEmployee(employee)} > Delete </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    async function checkConnectivity() {
        const response = await fetch('api/employees');
        const data = await response.json();
        setEmployees(data);//we're already getting a list of employees with the fetch request, so I'm making a new state to store the employee data.

        /* We send a request to the server to get the sum of all employee values where Name begins with A, B or C */
        /*
        We could also use a reducer on the front end to do the same thing with less cost, but I wanted to do it with the database and API calling:
        setMathsData(data.filter(element => element.charAt(0) === 'A' || element.charAt(0) === 'B' || element.charAt(0) === 'C').reduce((accumulator, element) => accumulator + element.value, 0))
        */
        const response2 = await fetch('api/list');
        const mathsData = await response2.json();
        setMathsData(mathsData);


        setDatabaseChanged(false);
        setLoading(false);
    }

    /*Checks for duplicate names in the employee array, returns false if there are no duplicates*/
    function checkDuplicates(employee:Employee){
        if(employees.findIndex((employeeElement) => employeeElement.name === employee.name) >= 0)
            return true;
        else
            return false;
    }

    /* PLEASE NOTE:
       I'm adding code to each of the database modification functions to show how the state could be directly updated rather than re-running an API call.
       Direct state updates are faster and more secure, but replicate code, can cause server desyncs if there's an error and make the program flow harder to read 
       */

    /* Adds a new employee to the database */
    async function addNewEmployee(employee:Employee){

        if(checkDuplicates(employee))// As the names are the only unique identifier in the database, we don't want duplicates as we won't be able to change them individually
            return "ERROR: There's already an employee with that name (maybe think up a nickname or something)";
        
        setLoading(true);// set loading flag, only for CSS at the moment

        const response = await fetch('api/employees', {//send the request
            method:"POST",//Post because it's sending a new entry to the server
            body:JSON.stringify(employee),//body is the employee object's data
            headers:{
                "Content-Type":"application/json"//we're sending it in a JSON format so have to tell the server what to expect
            }
        });
        
        const data = await response.json();
        if(data.name === employee.name){//successful response will include the inserted employee name and value, so we want to check that

            setDatabaseChanged(true);//setting database changed to true flags that the dataset needs to be re-queried.
            /* OR we could alter the state directly rather than making an API call to re-load the data
            const newEmployees = [...employees, employee];
            setEmployees(newEmployees);
            if(employee.name.charAt(0) === 'A' || employee.name.charAt(0) === 'B' || employee.name.charAt(0) === 'C')
                setMathsData(mathsData + employee.value)//Add on the value to the maths data rather than triggering an extra API call
            */
            return ""// no error return needed
        }
        else{
            setLoading(false);// don't want the cursor hanging on loading forever if the request errors
            return `Error: ${response.status}`
        }
    }

    async function changeExistingEmployee(employee:Employee){
        const oldEmployee = employees[editIndex]//find the old employee name as the pseudo-primary-key identifier
        if(oldEmployee === employee)// if the employee fields haven't changed, don't do anything
            return "";

        setLoading(true);

        if(oldEmployee.name !== employee.name && checkDuplicates(employee)){// we want to check that there isn't another employee of the same name, but we also want to allow an unchanged name with only value changed
            return "ERROR: There's already an employee with that name";
        }

        const encodedName = encodeURIComponent(oldEmployee.name);//encode url symbols that would cause weird interactions in the id
        const urlString = `api/employees/${encodedName}`;//send the employee name as the change id, and the new employee data as the request body

        const response = await fetch(urlString, {
            method:"PUT",//This is a PUT request because it's changing the entire entry rather than a specific portion.
            body:JSON.stringify(employee),
            headers:{
                "Content-Type":"application/json"
            }
        });
        const status = await response.status;
        if(status === 204){//204 is "No Content" - success code but nothing needs to be returned
            setDatabaseChanged(true);//setting database changed to true flags that the dataset needs to be re-queried.

            /* Code to change state directly:
            const newEmployees = [...employees];
            newEmployees[editIndex] = employee;//creating a changed employee array, then setting it in state

            setEmployees(newEmployees);

            // Change to the maths data when an employee name/value is changed
            // if both old and new names start with A-C, then the value increases by (newValue - oldValue)
            // and we can say that if either started outside A-C then it would have value of 0 (for our purposes)
            const mathsDataChange = (employee.name.charAt(0) === 'A' || employee.name.charAt(0) === 'B' || employee.name.charAt(0) === 'C' ?// if new name is within A-C range
                                    employee.value :// take employee value
                                    0) - //otherwise start at 0
                                    (oldEmployee.name.charAt(0) === 'A' || oldEmployee.name.charAt(0) === 'B' || oldEmployee.name.charAt(0) === 'C' ? // if old name was within A-C range
                                    oldEmployee.value:// minus the old value
                                    0) //otherwise minus nothing

            setMathsData(mathsData + mathsDataChange);*/

            setEditIndex(-1);//no longer editing anything
            return ""
        }
        else{
            setLoading(false);// don't want the cursor hanging on loading forever if the request errors
            return `Error: ${status}`
        }
    }

    async function deleteExistingEmployee(employee:Employee){
        setLoading(true);
        const encodedName = encodeURIComponent(employee.name);//encode url symbols that would cause weird interactions in the id
        const urlString = `api/employees/${encodedName}`;//prefer to send delete without an id in the url rather than a body in the request
        const response = await fetch(urlString, {
            method:"DELETE"
        });
        const status = await response.status;
        if(status === 204){//204 is "No Content" - success code but nothing needs to be returned
            setDatabaseChanged(true);
            /* Code to set the state directly:
            const newEmployees = employees.filter(employeeEntry => employee.name !== employeeEntry.name) ;//filter the deleted entry out of the array 

            setEmployees(newEmployees);//set the state
            if(employee.name.charAt(0) === 'A' || employee.name.charAt(0) === 'B' || employee.name.charAt(0) === 'C')
                setMathsData(mathsData - employee.value)//Remove the value from the maths data rather than triggering an extra API call

            return "" */

            return ""
        }
        else{
            setLoading(false);// don't want the cursor hanging on loading forever if the request errors
            return `Error: ${status}`
        }
    }

    async function pushTheButton(){
        setLoading(true);
        const response = await fetch("api/list", {
            method:"PATCH"//this is sent under PATCH because it's modifying many single fields rather than entire entries
        });
        const status = await response.status;
        console.log(status);
        if(status === 204)
            setDatabaseChanged(true);
        /*
            Code to directly change state:
            const newEmployees = employees.map((employee) = {
                const newValue = employee.value + (employee.name.charAt(0) === 'E' ? 1 : employee.name.charAt(0) === 'G' ? 10 : 100)
                return {
                    ...employee,
                    value:newValue
                };
            })
            setMathsData(newEmployees.filter(element => element.charAt(0) === 'A' || element.charAt(0) === 'B' || element.charAt(0) === 'C').reduce((accumulator, element) => accumulator + element.value, 0))
            setEmployees(newEmployees)
         */
        else{
            setLoading(false);// don't want the cursor hanging on loading forever if the request errors
            return `Error: ${status}`
        }
    }
}

export default App;