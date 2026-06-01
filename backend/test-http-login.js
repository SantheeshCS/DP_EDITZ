fetch('http://localhost:5000/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'sreesantheesh@gmail.com',
    password: 'dpadmin123'
  })
})
.then(async (res) => {
  const data = await res.json();
  if (res.ok) {
    console.log('HTTP Login Success:', data);
  } else {
    console.error('HTTP Login Failed (Status ' + res.status + '):', data);
  }
})
.catch(err => {
  console.error('HTTP network error:', err.message);
});
