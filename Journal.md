## Quick journal to keep track of what I'm doing, when

### Hour 1: Setup and Acquainting myself with the code
- Setup went pretty smoothly, honestly. Thanks, whoever set up the test.
- Grateful I started doing a quick revise of .NET APIs over the weekend!
- Task 1 (list all entities in database) completed mostly as a function of me testing if I understood what was going on.

### Hour 2: Forms for POST and PATCH, adding support in the API
- Took slightly over the hour, but I made a form that should support both POST and PATCH requests. No support in the API just yet.
- Taking a little bit more time than I expected because I'm trying to be good and use Typescript.

### Hour 3: Add form functionality for editing and deleting, write methods for Post, Patch and Delete into the API
- Buttons for edit and delete are simple enough, edit form takes in default values according to the employee data
- A little slower than I expected on this as well, but got a simple call for Post working. Patch and Delete shouldn't be too bad after this.
- Post also receives a response and alters the state if positive

### Hour 4: Finish off API calls for edit and delete, look at "do some maths" button functionality
- I've done the edit and delete functionality (and moved the edit from patch to push)
- Done the addition for the "do the maths" button, now looking at the aggregation
- I also added a quick duplicate checker in the client code to check for duplicated names

### Hour 5: Implement the maths button
- I've added in functionality for the button to run an update to the API database and update the cache
- Also added a counter for the A-C Value sum which gets data from the database

### Hour 6: Look at getting some frontend tests running
- Spent far too long setting up the test environment, but I got there in the end

### Hour 7: Write tests, validation for EmployeeForm
- Wrote basic tests for how the form should act, submit behaviour
- Added validation for the HTML inputs based on what data would break the database (i.e. name of > 50 characters, value > 2^31)
- Blank and fully whitespace inputs (which are trimmed -> become blank) also do weird things to the database, so I spent a bit of time finding the correct regex pattern for requiring a non-whitespace character somewhere

### Hour 8: Write tests for frontend API fetch calls
- Just making sure that the API calls trigger correctly and that database modifying API calls re-trigger the GETs.
- Did a little bit of formatting on the CSS to make the app more readable/prettier

### Hour 9: finishing up
- Added comments showing how I'd directly update the state on each database change rather than re-running an API query.
- Tested what would happen if the input name included !"£$%^&*()/@~{}[].,\| characters. Name would be added fine (because it's transferred in body) but wouldn't delete or update (as those are transferred in uri).
- Encoded uri to avoid those characters causing problems, then decoded on the other side.
- Added a reset to the new employee submission so the user can see that it's been successful without scrolling down.

### Issues, suggestions and similar
- Biggest suggestion is to use a unique primary key id. This will allow duplicate names, improve ordering and facilitate cheaper deletes and updatess.
- Ordering and filters - outside scope, but even 72 names is lot to scroll through so filters would probably be useful.
- Why SQL in the first place? (Obviously because that's the test) A single table with no relational data would be better stored in a non-relational database.

