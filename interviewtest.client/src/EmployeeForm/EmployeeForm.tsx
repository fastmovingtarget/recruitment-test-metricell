import { useState } from "react";
import Employee from "../Employee";

/* 
HTML form allowing for editing of employee data
inputs:
employee: Employee, the initial employee data to be edited.
submitEmployeeData: function, the function to be called when the form is submitted.
key: string, to stop the console from shouting at me
returns:
Form element containing labelled input fields for Name, Value and a submit button
*/
function EmployeeForm(
    {employee, submitEmployeeData, cancelHandler}:{employee: Employee, submitEmployeeData: (employee : Employee)=>Promise<string>, cancelHandler?:() => void}
) {

    const [employeeInput, setEmployeeInput] = useState<Employee>({...employee})
    const [errorText, setErrorText] = useState<string>("")

    /* sets employee state according to input's name and value 
        so input name = "nameKey" and value = "nameValue" => employee["nameKey"] = "nameValue"
    */
    function setInput(e){
        const { name , value } = e.target;// destructure event target to get the input element's name and value...which are distinct from the employee name and value. 
        setEmployeeInput((previousInput: Employee) => ({
            ...previousInput,
            [name]:value
        }));
    }

    async function handleSubmit(e){
        e.preventDefault();

        if(!e.target.checkValidity())
            return
        
        const result = await submitEmployeeData(employeeInput)
        setErrorText(result)
        if(result === "")//if the form submits successfully
            e.target.reset();//reset it to let the user know their changes have gone through
    }

    return (
        <form onSubmit={e => handleSubmit(e)} className="row">
            <input type="text"
                    name="name"//input element name corresponds to employee["name"]
                    className="text-input"
                    data-testid="name-input-element"
                    maxLength={50/* defined in server-side database */}
                    defaultValue={employee.name /* So that existing values can be edited */}
                    pattern=".*\S.*"
                    title="Blank or entirely whitespace entries are not permitted"//and tell people what's allowed
                    onInput={e => setInput(e)}
                    required // while empty string is technically accepted in the database insert, it messes with the delete and update handling. And also don't want employees without names, that's not a good idea
            />
            <input type="number"
                    name="value"//input element name corresponds to employee["name"]
                    className="text-input"
                    data-testid="value-input-element"
                    min={0 /* Depends on the metric for values, but I don't see any negatives in database so I'm not allowing any negatives here */}
                    max={2147483647 /* 2^31 - 1 is the maximum the database can handle*/}
                    defaultValue={employee.value /* So that existing values can be edited */}
                    onInput={e => setInput(e)}
                    required//null isn't handled by the api call, so don't allow it
            />
            <input className="button" type="submit" value="Submit"/>
            {cancelHandler ? <input  className="button form-button" type="button" value="Cancel" onClick={() => cancelHandler()}/> : null}
            {
                errorText !== "" ?
                <p>{errorText}</p>
                : null
            }
        </form>
    );
}

export default EmployeeForm;