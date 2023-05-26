async function buildJobsTable(jobsTable, jobsTableHeader, token, message) {
  try {
    const response = await fetch("/api/v1/jobs", { // Send GET request to /api/v1/jobs to get list of jobs
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json(); // Convert response to JSON format
    var children = [jobsTableHeader];   // Create an array to store the table rows
    if (response.status === 200) { // Check if there are any jobs in the response
      if (data.count === 0) {  // If there are no jobs, clear the table and return
        jobsTable.replaceChildren(...children); // clear this for safety
        return 0;
      } else {
        for (let i = 0; i < data.jobs.length; i++) {  // If there are jobs, loop through the jobs and create table rows for each job
          // create the edit and delete buttons with the job ID as a data attribute
          let editButton = `<td><button type="button" class="editButton" data-id=${data.jobs[i]._id}>edit</button></td>`;
          let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.jobs[i]._id}>delete</button></td>`;
          // create the HTML for the table row with the job data and buttons
          let rowHTML = `<td>${data.jobs[i].company}</td><td>${data.jobs[i].position}</td><td>${data.jobs[i].status}</td>${editButton}${deleteButton}`;
          // create a new table row element and set its innerHTML to the row HTML
          let rowEntry = document.createElement("tr");
          rowEntry.innerHTML = rowHTML;
          children.push(rowEntry); // add the new row element to the children array
        }
        jobsTable.replaceChildren(...children);  // replace the children of the jobsTable with the new header row and the generated data rows
        // Add event listener for delete buttons
        const deleteButtons = document.querySelectorAll(".deleteButton"); //Add event listener for delete button in else block of loop through data
        deleteButtons.forEach((button) => {
          button.addEventListener("click", async (e) => {
            const jobId = e.target.dataset.id;  // get the job ID from the data-id attribute of the button
            try {
              // Make a DELETE request to the server to delete the job with the specified ID
              const deleteResponse = await fetch(`/api/v1/jobs/${jobId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,  // include the authentication token in the request header
                },
              });
              const deleteData = await deleteResponse.json(); // parse the response data as JSON
              if (deleteResponse.status === 200) {  // check if the delete request was successful
                message.textContent = deleteData.msg;  // display success message in message p
                // Redraw the table to show the updated list of entries
                const displayEvent = new Event("startDisplay");
                document.dispatchEvent(displayEvent);
              } else { // if delete request was unsuccessful
                message.textContent = deleteData.msg;   // display error message in message p
              }
            } catch (err) {   // handle errors
              message.textContent = "A communication error occurred.";
            }
          });
        });
      }
      return data.count;  // return the number of jobs found
    } else {  // handle error response status codes
      // update the message element with the error message
      message.textContent = data.msg;
      return 0; // return 0 to indicate an error occurred
    }
  } catch (err) { // handle communication errors
    // update the message element with the error message
    message.textContent = "A communication error occurred.";
    return 0;  // return 0 to indicate an error occurred
  }
}

document.addEventListener("DOMContentLoaded", () => {
    const logoff = document.getElementById("logoff");
    const message = document.getElementById("message");
    const logonRegister = document.getElementById("logon-register");
    const logon = document.getElementById("logon");
    const register = document.getElementById("register");
    const logonDiv = document.getElementById("logon-div");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const logonButton = document.getElementById("logon-button");
    const logonCancel = document.getElementById("logon-cancel");
    const registerDiv = document.getElementById("register-div");
    const name = document.getElementById("name");
    const email1 = document.getElementById("email1");
    const password1 = document.getElementById("password1");
    const password2 = document.getElementById("password2");
    const registerButton = document.getElementById("register-button");
    const registerCancel = document.getElementById("register-cancel");
    const jobs = document.getElementById("jobs");
    const jobsTable = document.getElementById("jobs-table");
    const jobsTableHeader = document.getElementById("jobs-table-header");
    const addJob = document.getElementById("add-job");
    const editJob = document.getElementById("edit-job");
    const company = document.getElementById("company");
    const position = document.getElementById("position");
    const status = document.getElementById("status");
    const addingJob = document.getElementById("adding-job");
    const jobsMessage = document.getElementById("jobs-message");
    const editCancel = document.getElementById("edit-cancel");
  
    // section 2 
    let showing = logonRegister;  // Initialize showing and token variables
    let token = null;
    document.addEventListener("startDisplay", async () => {  // Listen for the "startDisplay" event to be dispatched
      showing = logonRegister;  // Set the showing variable to logonRegister
      token = localStorage.getItem("token");  // Retrieve the token from the localStorage
      if (token) {
        //if the user is logged in
        logoff.style.display = "block";   // Display the logoff button
        const count = await buildJobsTable(   // Build the jobs table with the user's token and display it
          jobsTable,
          jobsTableHeader,
          token,
          message
        );
        if (count > 0) {
          jobsMessage.textContent = "";
          jobsTable.style.display = "block";
        } else {
          jobsMessage.textContent = "There are no jobs to display for this user.";
          jobsTable.style.display = "none";
        }
        jobs.style.display = "block";
        showing = jobs;  // Set the showing variable to jobs
      } else {   // If the user is not logged in, display the logon/register form
        logonRegister.style.display = "block";
      }
    });
  
    var thisEvent = new Event("startDisplay");  // Create and dispatch the "startDisplay" event
    document.dispatchEvent(thisEvent);
    var suspendInput = false;  // Set suspendInput variable to false
  
    // section 3
    document.addEventListener("click", async (e) => {  // Add an event listener for a click event
        if (suspendInput) {  // Check if we should suspend input 
          return; // we don't want to act on buttons while doing async operations
        }
        if (e.target.nodeName === "BUTTON") {  // Clear the message text content if a button is clicked
          message.textContent = "";
        }
        if (e.target === logoff) {  // Handle the logoff button click event
          localStorage.removeItem("token");  // Remove the token from local storage and set it to null
          token = null;
          showing.style.display = "none";   // Hide the showing element and show the logon/register element
          logonRegister.style.display = "block";
          showing = logonRegister;
          jobsTable.replaceChildren(jobsTableHeader); // don't want other users to see  // Replace the child nodes of the jobs table with the jobs table header
          message.textContent = "You are logged off.";  // Set the message text content to indicate the user is logged off
        } else if (e.target === logon) {   // Handle the logon button click event
          showing.style.display = "none";  // Hide the showing element and show the register div
          logonDiv.style.display = "block";
          showing = logonDiv;
        } else if (e.target === register) {  // Handle the logon cancel or register cancel button click event
          showing.style.display = "none";  // Hide the showing element and show the logon/register element
          registerDiv.style.display = "block";
          showing = registerDiv;
        } else if (e.target === logonCancel || e.target == registerCancel) {
          showing.style.display = "none";
          logonRegister.style.display = "block";
          showing = logonRegister;
          email.value = "";   // Clear the input fields
          password.value = "";
          name.value = "";
          email1.value = "";
          password1.value = "";
          password2.value = "";
        } else if (e.target === logonButton) {  // Handle the logon button click event
          suspendInput = true;  // Suspend input (prevent further input while doing async operations)
          try {
            const response = await fetch("/api/v1/auth/login", {  // Send a fetch request to the login endpoint with email and password data
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: email.value,
                password: password.value,
              }),
            });
            const data = await response.json();  // Parse the response data
            if (response.status === 200) {    // Handle a successful login
              message.textContent = `Logon successful.  Welcome ${data.user.name}`;  // Set the message text content to indicate a successful login
              token = data.token;  // Set the token to the received token and save it to local storage
              localStorage.setItem("token", token);
              showing.style.display = "none";  // Hide the showing element and dispatch a startDisplay event
              thisEvent = new Event("startDisplay");
              email.value = "";
              password.value = "";
              document.dispatchEvent(thisEvent);
            } else { // Handle an unsuccessful login
              message.textContent = data.msg;  // Set the message text content to indicate the error message
            }
          } catch (err) {  // if an error occurs during the fetch request, catch it and display a message
            message.textContent = "A communications error occurred.";
          }
          suspendInput = false;
        } else if (e.target === registerButton) { // if the register button was clicked
          if (password1.value != password2.value) {  // check if the passwords entered match
            message.textContent = "The passwords entered do not match.";
          } else {
            suspendInput = true;  // disable form input
            try {  // attempt to register user with API call
              const response = await fetch("/api/v1/auth/register", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: name.value,
                  email: email1.value,
                  password: password1.value,
                }),
              });
              const data = await response.json();  // get response data
              if (response.status === 201) {  // if registration was successful
                message.textContent = `Registration successful.  Welcome ${data.user.name}`;
                token = data.token;  // store user token
                localStorage.setItem("token", token);  // store token in local storag
                showing.style.display = "none";  // hide registration form
                thisEvent = new Event("startDisplay");
                document.dispatchEvent(thisEvent);  // trigger startDisplay event to show main content
                name.value = "";
                email1.value = "";
                password1.value = "";
                password2.value = "";
              } else {  // if registration was unsuccessful
                message.textContent = data.msg;   // display error message from server
              }
            } catch (err) { // if an error occurs during the API call, catch it and display a message
              message.textContent = "A communications error occurred.";
            }
            suspendInput = false;  // re-enable form input
          }
        } // section 4
        else if (e.target === addJob) {
            showing.style.display = "none";   // Hide the showing element and show the editJob element
            editJob.style.display = "block";
            showing = editJob;   // Set the showing element to editJob and delete its data-id attribute
            delete editJob.dataset.id;
            company.value = "";  // Clear input values and set status to pending
            position.value = "";
            status.value = "pending";
            addingJob.textContent = "add";  // Change the text content of addingJob to "add"
          } else if (e.target === editCancel) {
            showing.style.display = "none";  // Hide the showing element and clear input values
            company.value = "";
            position.value = "";
            status.value = "pending";
            thisEvent = new Event("startDisplay");  // Dispatch a "startDisplay" event
            document.dispatchEvent(thisEvent);
          } else if (e.target === addingJob) {
      
            if (!editJob.dataset.id) {
              // this is an attempted add  // Disable input during fetch
              suspendInput = true;
              try {
                const response = await fetch("/api/v1/jobs", {  // Send a POST request to the server with input values
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    company: company.value,
                    position: position.value,
                    status: status.value,
                  }),
                });
                const data = await response.json();  // Parse the response data
                if (response.status === 201) {
                  //successful create  // If the request is successful, show a success message and reset input values
                  message.textContent = "The job entry was created.";
                  showing.style.display = "none";
                  thisEvent = new Event("startDisplay");
                  document.dispatchEvent(thisEvent);
                  company.value = "";
                  position.value = "";
                  status.value = "pending";
                } else {  // If the request fails, show the error message
                  // failure
                  message.textContent = data.msg;
                }
              } catch (err) {  // If there is a communication error, show an error message
                message.textContent = "A communication error occurred.";
              }
              suspendInput = false;    // Enable input after fetch
            } else {
              // this is an update   // Disable input during fetch
              suspendInput = true;  
              try {  // Send a PATCH request to the server with input values
                const jobID = editJob.dataset.id;
                const response = await fetch(`/api/v1/jobs/${jobID}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    company: company.value,
                    position: position.value,
                    status: status.value,
                  }),
                });
                const data = await response.json();  // Parse the response data
                if (response.status === 200) {
                  message.textContent = "The entry was updated.";  // If the request is successful, show a success message and reset input values
                  showing.style.display = "none";
                  company.value = "";
                  position.value = "";
                  status.value = "pending";
                  thisEvent = new Event("startDisplay");
                  document.dispatchEvent(thisEvent);
                } else {   // If the request fails, show the error message
                  message.textContent = data.msg;
                }
              } catch (err) {  // If there is a communication error, show an error message
      
                message.textContent = "A communication error occurred.";
              }
            }
            suspendInput = false;
          } // section 5
          else if (e.target.classList.contains("editButton")) {  // If the user clicks on an "edit" button for a specific job entry:
            editJob.dataset.id = e.target.dataset.id;  // Store the job ID in the "data-id" attribute of the editJob element
            suspendInput = true;  // Disable user input temporarily
            try {
              const response = await fetch(`/api/v1/jobs/${e.target.dataset.id}`, {  // Fetch the job data from the API endpoint
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,  // Include the user's token for authorization
                },
              });
              const data = await response.json();  // Parse the response data
              if (response.status === 200) {  // If the request is successful:
                company.value = data.job.company;  // Set the value of the company input to the job's company value
                position.value = data.job.position;  // Set the value of the position input to the job's position value
                status.value = data.job.status;  // Set the value of the status input to the job's status value
                showing.style.display = "none";  // Hide the showing element (either addJob or editJob)
                showing = editJob;  // Set showing to the editJob element
                showing.style.display = "block";   // Show the editJob element
                addingJob.textContent = "update";  // Change the text of the addingJob button to "update"
                message.textContent = "";  // Clear any error messages
              } else {
                // might happen if the list has been updated since last display
                message.textContent = "The jobs entry was not found";  // Display an error message
                thisEvent = new Event("startDisplay");  // Dispatch an event to reset the display
                document.dispatchEvent(thisEvent);
              }
            } catch (err) {   // If there is a communications error:
              message.textContent = "A communications error has occurred.";  // Display an error message
            }
            suspendInput = false;  // Enable user input again
          }
      })    
  });

