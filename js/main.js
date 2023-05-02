let taskName = document.querySelector("input[name='task']");
let containers = document.querySelectorAll(".tasks");
let form = document.querySelector("form");
let [todo, doing, done] = containers;

function updateCounter() {
    document.querySelectorAll("details").forEach((value) => {
        let span = document.querySelector(`#${value.id} span`);
        if (value.children.length - 1) {
            return (span.textContent = value.children.length - 1);
        }
        span.textContent = 0;
        value.open = false;
    });
}

function loadStorage() {
    Object.keys(localStorage)
        .sort((a, b) => +a - +b)
        .forEach((index) => {
            let task = JSON.parse(localStorage.getItem(index));
            createTask(task.parent, task.text);
        });
    updateCounter();
}

function updateData() {
    document.querySelectorAll(".task").forEach((task, index) => {
        localStorage.setItem(
            index,
            JSON.stringify({
                parent: task.parentElement.id,
                text: task.textContent,
            })
        );
    });
    updateCounter();
}

function createTask(parent, text) {
    let task = document.createElement("div");
    task.addEventListener("click", () => {
        task.remove();
        localStorage.clear();
        updateData();
    });
    task.addEventListener("mouseenter", () =>
        !document.querySelector(".dragging")
            ? (task.style.backgroundColor = window
                .getComputedStyle(task.parentElement)
                .getPropertyValue("border-color"))
            : null
    );
    task.addEventListener("mouseleave", () =>
        !task.classList.contains("dragging")
            ? (task.style.backgroundColor = "transparent")
            : null
    );
    task.addEventListener("dragstart", () => task.classList.add("dragging"));
    task.addEventListener("dragend", () => task.classList.remove("dragging"));
    task.draggable = true;
    task.className = "task";
    task.textContent = text;

    let grabIcon = document.createElement("i");
    grabIcon.className = "fa-solid fa-grip-lines";
    task.appendChild(grabIcon);

    let container = document.getElementById(parent);
    container.appendChild(task);
    task.style.borderColor = window
        .getComputedStyle(container)
        .getPropertyValue("border-color");

    createTask.caller.name === "createTaskCaller"
        ? (container.open = true)
        : null;
}

function getDragPosition(container, y) {
    let allTasks = [...container.querySelectorAll(".task:not(.dragging)")];

    return allTasks.reduce(
        (closet, child) => {
            let box = child.getBoundingClientRect();
            let offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closet.offset) {
                return { offset: offset, element: child };
            } else {
                return closet;
            }
        },
        {
            offset: Number.NEGATIVE_INFINITY,
        }
    ).element;
}

form.addEventListener("submit", function createTaskCaller(event) {
    event.preventDefault();
    createTask("todo", taskName.value);
    taskName.value = "";
    updateData();
});

containers.forEach((container) => {
    container.addEventListener("dragover", (event) => {
        event.preventDefault();
        let task = document.querySelector(".dragging");
        let afterElement = getDragPosition(container, event.clientY);
        let borderColor = window
            .getComputedStyle(task.parentElement)
            .getPropertyValue("border-color");

        task.style.borderColor = borderColor;
        task.style.backgroundColor = borderColor;

        if (afterElement) {
            container.insertBefore(task, afterElement);
        } else {
            container.append(task);
        }
        container.open = true;
        updateData();
    });
});

loadStorage();
