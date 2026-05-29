async function callApi(path, options = {}) {
  try {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, data: { error: err.message } };
  }
}

document.getElementById("healthBtn").addEventListener("click", async () => {
  const s = document.getElementById("healthStatus");
  const o = document.getElementById("healthOutput");
  s.textContent = "checking...";
  s.className = "status status-wait";
  o.classList.remove("hidden");
  const { status, data } = await callApi("/api/health");
  s.textContent = status === 200 ? "healthy" : `error (${status})`;
  s.className = status === 200 ? "status status-ok" : "status status-err";
  o.textContent = JSON.stringify(data, null, 2);
});

document.getElementById("listUsersBtn").addEventListener("click", async () => {
  const o = document.getElementById("usersOutput");
  o.classList.remove("hidden");
  o.textContent = "Loading...";
  const { status, data } = await callApi("/api/users");
  if (status === 200 && Array.isArray(data)) {
    o.textContent = data.length === 0 ? "No users yet. Add one above!" : JSON.stringify(data, null, 2);
  } else {
    o.textContent = `Error (${status}): ${JSON.stringify(data)}`;
  }
});

document.getElementById("addUserBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value.trim();
  const o = document.getElementById("usersOutput");
  if (!email || !email.includes("@")) {
    o.classList.remove("hidden");
    o.textContent = "Please enter a valid email address.";
    return;
  }
  o.classList.remove("hidden");
  o.textContent = "Creating user...";
  const { status, data } = await callApi("/api/users", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (status === 201) {
    o.textContent = `User created!\n${JSON.stringify(data, null, 2)}`;
    document.getElementById("emailInput").value = "";
    document.getElementById("listUsersBtn").click();
  } else {
    o.textContent = `Error (${status}): ${JSON.stringify(data)}`;
  }
});
