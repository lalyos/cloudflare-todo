const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Todo</title>
    <style>
        body { font-family: sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
        form { display: flex; gap: 10px; margin-bottom: 20px; }
        input { flex-grow: 1; padding: 8px; }
        ul { list-style: none; padding: 0; }
        li { display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee; }
        .task { flex-grow: 1; cursor: pointer; }
        .completed { text-decoration: line-through; color: #888; }
        button.del { color: red; border: none; background: none; cursor: pointer; }
    </style>
</head>
<body>
    <h1>Todo List</h1>
    <form id="todo-form">
        <input type="text" id="task-input" placeholder="New task..." required>
        <button type="submit">Add</button>
    </form>
    <ul id="todo-list"></ul>

    <script>
        const form = document.getElementById('todo-form');
        const input = document.getElementById('task-input');
        const list = document.getElementById('todo-list');
        const apiPath = window.location.pathname.replace(/\\/$/, "");

        async function fetchTodos() {
            try {
                const res = await fetch(apiPath + '/todos');
                const todos = await res.json();
                list.innerHTML = '';
                todos.forEach(todo => {
                    const li = document.createElement('li');
                    li.innerHTML = \`
                        <span class="task \${todo.completed ? 'completed' : ''}" onclick="toggleTodo(\${todo.id}, \${todo.completed})">\${todo.task}</span>
                        <button class="del" onclick="deleteTodo(\${todo.id})">✕</button>
                    \`;
                    list.appendChild(li);
                });
            } catch (e) { console.error('Fetch error:', e); }
        }

        form.onsubmit = async (e) => {
            e.preventDefault();
            await fetch(apiPath + '/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task: input.value })
            });
            input.value = '';
            fetchTodos();
        };

        window.toggleTodo = async (id, currentStatus) => {
            await fetch(apiPath + '/todos/' + id, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !currentStatus })
            });
            fetchTodos();
        };

        window.deleteTodo = async (id) => {
            await fetch(apiPath + '/todos/' + id, { method: 'DELETE' });
            fetchTodos();
        };

        fetchTodos();
    </script>
</body>
</html>
`;

let todos = [
  { id: 1, task: "Buy milk", completed: false },
  { id: 2, task: "Write worker", completed: true }
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // Main UI: Match root or the specific worker path
      if (request.method === "GET" && (pathname === "/" || pathname === "" || pathname.endsWith("/todo-api") || pathname.endsWith("/todo-api/"))) {
        return new Response(html, { headers: { "Content-Type": "text/html" } });
      }

      if (pathname.endsWith("/todos")) {
        if (request.method === "GET") {
          return new Response(JSON.stringify(todos), { headers: { "Content-Type": "application/json" } });
        }
        if (request.method === "POST") {
          const body = await request.json();
          const newTodo = { id: Date.now(), task: body.task, completed: false };
          todos.push(newTodo);
          return new Response(JSON.stringify(newTodo), { status: 201, headers: { "Content-Type": "application/json" } });
        }
      }

      const idMatch = pathname.match(/\/todos\/(\d+)$/);
      if (idMatch) {
        const id = parseInt(idMatch[1]);
        if (request.method === "PATCH") {
          const body = await request.json();
          const todo = todos.find(t => t.id === id);
          if (todo) {
            todo.completed = body.completed;
            return new Response(JSON.stringify(todo), { headers: { "Content-Type": "application/json" } });
          }
        }
        if (request.method === "DELETE") {
          todos = todos.filter(t => t.id !== id);
          return new Response(null, { status: 204 });
        }
      }

      return new Response("Not Found: " + pathname, { status: 404 });
    } catch (err) {
      return new Response(err.stack || err.toString(), { status: 500 });
    }
  }
};
