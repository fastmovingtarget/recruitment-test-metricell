using InterviewTest.Server.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace InterviewTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        [HttpGet]
        public List<Employee> Get()
        {
            var employees = new List<Employee>();

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = @"SELECT Name, Value FROM Employees";
                using (var reader = queryCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        employees.Add(new Employee
                        {
                            Name = reader.GetString(0),
                            Value = reader.GetInt32(1)
                        });
                    }
                }
            }

            return employees;
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult AddEmployee(Employee employee)
        {
            //var employees = new List<Employee>();
            IActionResult returnObject;

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = @"INSERT INTO Employees (Name, Value) VALUES ($Name, $Value)";
                queryCmd.Parameters.AddWithValue("$Name", employee.Name);
                queryCmd.Parameters.AddWithValue("$Value", employee.Value);
                var queryResponse = queryCmd.ExecuteNonQuery();
                if(queryResponse == 1){
                    returnObject = CreatedAtAction("AddEmployee", employee);
                }
                else{
                    returnObject = BadRequest();
                }
                           
            }
            return returnObject;
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult UpdateEmployee(string id, Employee employee)
        {
            //var employees = new List<Employee>();
            IActionResult returnObject;

            String unescapedId = Uri.UnescapeDataString(id);//unencode/unescape weird symbols that could be in the name 

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = @"UPDATE Employees SET Name = $Name, Value = $Value WHERE Name = $id";
                queryCmd.Parameters.AddWithValue("$Name", employee.Name);
                queryCmd.Parameters.AddWithValue("$Value", employee.Value);
                queryCmd.Parameters.AddWithValue("$id", unescapedId);
                var queryResponse = queryCmd.ExecuteNonQuery();
                if(queryResponse == 1){
                    returnObject = NoContent();
                }
                else{
                    returnObject = BadRequest();
                }
                           
            }
            return returnObject;
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult DeleteEmployee(string id)
        {
            IActionResult returnObject;

            String unescapedId = Uri.UnescapeDataString(id);//unencode symbolic weirdery

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = @"DELETE FROM Employees WHERE Name = $id";
                queryCmd.Parameters.AddWithValue("$id", unescapedId);
                var queryResponse = queryCmd.ExecuteNonQuery();
                if(queryResponse == 1){
                    returnObject = NoContent();
                }
                else{
                    returnObject = BadRequest();
                }
                           
            }
            return returnObject;
        }
        
    }
}
