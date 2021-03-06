var pageContentEl = document.querySelector("#page-content");
var taskIdCounter = 0;
var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");
var tasks = [];

var taskFormHandler = function(event) {
    event.preventDefault();
    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    //check if input values are emtpy strings
    if(!taskNameInput || !taskTypeInput) {
        alert("You  need to fill out the task from!");
        return false;
    }
    
    formEl.reset();

    var isEdit = formEl.hasAttribute("data-task-id");
    
    //has data attribute, so get task id and call function to complete edit process
    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    // no data attribute, so create object as normal and pass to createTaskEl function
    else{       //package up data as an object
        var taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        }; 
        createTaskEl(taskDataObj);   
    }
}

var createTaskEl = function(taskDataObj) {
    //creat list item
    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";

    //add task id as a custom attribute
    listItemEl.setAttribute("data-task-id", taskIdCounter);

    //create div to hold task info and add to list item
    var taskInfoEl = document.createElement("div");
    //give it a class name
    taskInfoEl.className = "task-info";
    //add HTML content to div
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";

    listItemEl.appendChild(taskInfoEl);

    var taskActionEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionEl);

    switch (taskDataObj.status) {
        case "to do":
          taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 0;
          tasksToDoEl.append(listItemEl);
          break;
        case "in progress":
          taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 1;
          tasksInProgressEl.append(listItemEl);
          break;
        case "completed":
          taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 2;
          tasksCompletedEl.append(listItemEl);
          break;
        default:
          console.log("Something went wrong!");
      }

    taskDataObj.id = taskIdCounter;
    tasks.push(taskDataObj);
    //add entire list item to list
    tasksToDoEl.appendChild(listItemEl);

    //increase task counter for next unique id
    taskIdCounter++;

    saveTasks();
}

var createTaskActions = function(taskId) {
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    //create edit button
    var editButonEl = document.createElement("button");
    editButonEl.textContent = "Edit";
    editButonEl.className = "btn edit-btn";
    editButonEl.setAttribute("data-task-id",taskId);

    actionContainerEl.appendChild(editButonEl);

    //create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    actionContainerEl.appendChild(deleteButtonEl);

    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name","status-change");
    statusSelectEl.setAttribute("data-task-id",taskId);

    actionContainerEl.appendChild(statusSelectEl);

    var statusChoices = ["To Do", "In Progress", "Completed"];
    for(var i=0; i<statusChoices.length; i++) {
        //create option element
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        //append to select
        statusSelectEl.appendChild(statusOptionEl);
    }
    return actionContainerEl;
}

formEl.addEventListener("submit", taskFormHandler);

var deleteTask = function(taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    //create new array to hold updated list of tasks
    var updatedTaskArr = [];

    //loop through current tasks
    for (var i=0; i<tasks.length; i++) {
        /*if tasks[i].id doesn't match the value of taskID, let's keep that task and
          push it into the new array*/
        if(tasks[i].id !== parseInt(taskId)) {
            updatedTaskArr.push(tasks[i]);
        }
    }
    //reassign tasks array to be the same as updatedTaskArr
    tasks = updatedTaskArr;

    saveTasks();
};

var editTask = function(taskId) {
    //get task list item element
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //get content from task name and type
    var taskName = taskSelected.querySelector("h3.task-name").textContent;
    var taskType = taskSelected.querySelector("span.task-type").textContent;
    
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;

    //change "add task" button to "save-task"
    document.querySelector("#save-task").textContent = "Save Task";

    //include task's id
    formEl.setAttribute("data-task-id", taskId);
}

var taskButtonHandler = function(event) {
    //get target element from event
    var targetEl = event.target;

    if(targetEl.matches(".edit-btn")) {
        var taskId = event.target.getAttribute("data-task-id");
        editTask(taskId);
    }

    else if(targetEl.matches(".delete-btn")) {
        //get the element's task id
        var taskId = event.target.getAttribute("data-task-id");
        deleteTask(taskId);
    }
};

var completeEditTask = function(taskName, taskType, taskId) {
    //fin the matching task list item
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    //set new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType

    //loop through tasks array and task object with new content
    for (var i=0; i<tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    };

    alert("Task Updated!");

    //reseting from and changin button text back to normal
    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";

    saveTasks();
}

var taskStatusChangeHandler = function(event) {
    //get the task item's id
    var taskId = event.target.getAttribute("data-task-id");

    //get the currently selected option's value and convert to lowercase
    var statusValue = event.target.value.toLowerCase();

    //find the parent task item element based on the id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']")

    if(statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if(statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if(statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }
    //update task's in tasks array
    for (var i=0; i<tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }

    saveTasks();
};

var saveTasks = function() {
    localStorage.setItem("tasks",JSON.stringify(tasks));
}

// var updatedTasks = []

var loadTasks = function() {
    var newTasks = localStorage.getItem("tasks");
    
    if(!newTasks) {
        return false
    };

    newTasks = JSON.parse(newTasks);

    for (var i=0; i<newTasks.length; i++) {
        createTaskEl(newTasks[i]);
    }
}

pageContentEl.addEventListener("click",taskButtonHandler);
pageContentEl.addEventListener("change",taskStatusChangeHandler);

loadTasks();