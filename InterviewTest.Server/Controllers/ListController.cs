using InterviewTest.Server.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace InterviewTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListController : ControllerBase
    {
        public ListController()
        {
        }

        /*Gets the total value of employees A-C.
        Uses /api/list mostly because there's another get in employees, so better to use a different controller.*/
        [HttpGet]
        public long ABCAggregate(string id)
        {
            var employees = new List<Employee>();

            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmd = connection.CreateCommand();
                queryCmd.CommandText = @"SELECT SUM(Value) FROM Employees 
                WHERE substr(Name, 1, 1) = 'A' 
                OR substr(Name, 1, 1) = 'B' 
                OR substr(Name, 1, 1) = 'C'";
                using (var reader = queryCmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        return reader.GetInt32(0);
                    }
                }
            }
            return 0;
        }
        /*Push button increases each employees value by the specified amount
        I'm including this as a call to /api/list rather than /api/employees because it affects the list as a whole rather than editing a single employee */
        [HttpPatch]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public IActionResult PushTheButton()
        {
            var connectionStringBuilder = new SqliteConnectionStringBuilder() { DataSource = "./SqliteDB.db" };
            using (var connection = new SqliteConnection(connectionStringBuilder.ConnectionString))
            {
                connection.Open();

                var queryCmdUpdate = connection.CreateCommand();
                queryCmdUpdate.CommandText = @"UPDATE Employees SET Value = CASE
                    WHEN substr(Name, 1, 1) = 'E' THEN Value + 1
                    WHEN substr(Name, 1, 1) = 'G' THEN Value + 10
                    ELSE Value + 100 END";
                var queryResponse = queryCmdUpdate.ExecuteNonQuery();
                if(queryResponse >= 0)
                    return NoContent();
                
                return BadRequest();
            }
        }
         
    }
}
