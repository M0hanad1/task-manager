let form = document.querySelector("form");
let taskName = form.firstElementChild;
let containers = document.querySelectorAll(".tasks");
let [todo, doing, done] = containers;

function loadStorage() {
    Object.keys(localStorage)
        .sort((a, b) => +a - +b)
        .forEach((index) => {
            let task = JSON.parse(localStorage.getItem(index));
            createTask(task.parent, task.text);
        });
}

function updateStorage() {
    document.querySelectorAll(".task").forEach((task, index) => {
        localStorage.setItem(
            index,
            JSON.stringify({
                parent: task.parentElement.id,
                text: task.textContent,
            })
        );
    });
}

function createTask(parent, text) {
    let task = document.createElement("div");
    task.onclick = () => {
        task.remove();
        localStorage.clear();
        updateStorage();
    };
    task.ondragstart = () => task.classList.add("dragging");
    task.ondragend = () => task.classList.remove("dragging");
    task.draggable = true;
    task.className = "task";
    task.textContent = text;
    document.getElementById(parent).appendChild(task);
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

form.onsubmit = (event) => {
    createTask("todo", taskName.value);
    taskName.value = "";
    updateStorage();
    event.preventDefault();
};

containers.forEach((container) => {
    container.ondragover = (event) => {
        event.preventDefault();
        let task = document.querySelector(".dragging");
        let afterElement = getDragPosition(container, event.clientY);

        if (afterElement) {
            container.insertBefore(task, afterElement);
        } else {
            container.append(task);
        }
        updateStorage();
    };
});

loadStorage();
