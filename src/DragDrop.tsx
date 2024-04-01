import React, { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
}

const DragDropExample = () => {
  const [tasks, setTasks] = useState<Task[]>();
  const [dropIndicator, setDropIndicator] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
      })
      .catch((err) => {
        console.error("err", err);
        if (!sessionStorage.getItem("showError")) {
          const ok = window.confirm(
            "Make sure to run the JSON server by running 'npm run server'"
          );
          if (ok) {
            window.location.reload();
            sessionStorage.setItem("showError", "true");
          }
        }
      });
  }, []);

  const updateTask = (task: Task) => {
    fetch(`http://localhost:3001/tasks/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    taskId: string
  ) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.clearData();
    setDropIndicator(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");

    const task = tasks?.find((task) => +task.id === +taskId);

    if (task) {
      task.status = status;
      updateTask(task);
      setTasks((prevTasks) =>
        prevTasks?.map((_task) => (_task.id === task?.id ? task : _task))
      );
    }

    setDropIndicator(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropIndicator(e.currentTarget.id);
  };

  const renderTasks = (status: string) => {
    return tasks
      ?.filter((task) => task.status === status)
      .map((task) => (
        <div
          key={task.id}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragEnd={handleDragEnd}
          className={`w-full p-2 bg-gray-100 rounded ${
            dropIndicator === status ? "bg-blue-200 " : ""
          }`}
        >
          {task.title}
        </div>
      ));
  };

  return (
    <div className="flex flex-col p-6 h-screen dark:bg-gray-900">
      <div className="grid grid-cols-3 gap-2">
        <h2 className="text-center dark:text-white">Todo</h2>
        <h2 className="text-center dark:text-white">In Progress</h2>
        <h2 className="text-center dark:text-white">Done</h2>

        <div
          id="todo"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "todo")}
          className={`flex flex-col items-center justify-start w-full border-2 border-dashed p-0.5 gap-1 rounded ${
            dropIndicator === "todo" ? "bg-blue-100 " : ""
          }`}
        >
          {renderTasks("todo")}
        </div>

        <div
          id="in-progress"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "in-progress")}
          className={`flex flex-col items-center justify-start w-full border-2 border-dashed p-0.5 gap-1 rounded ${
            dropIndicator === "in-progress" ? "bg-blue-100 " : ""
          }`}
        >
          {renderTasks("in-progress")}
        </div>

        <div
          id="done"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, "done")}
          className={`flex flex-col items-center justify-start w-full border-2 border-dashed p-0.5 gap-1 rounded ${
            dropIndicator === "done" ? "bg-blue-100 " : ""
          }`}
        >
          {renderTasks("done")}
        </div>
      </div>
    </div>
  );
};

export default DragDropExample;
