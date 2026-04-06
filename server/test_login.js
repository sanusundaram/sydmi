const axios = require('axios');

async function test() {
  console.log("--- Testing Register ---");
  try {
    const r1 = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Tester', email: 'tester2@test.com', password: 'password', role: 'student'
    });
    console.log("Register Success:", r1.data.user.email);
  } catch(e) {
    console.log("Register Error:", JSON.stringify(e.response ? e.response.data : e.message, null, 2));
  }

  console.log("--- Testing Login ---");
  try {
    const r2 = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'tester2@test.com', password: 'password'
    });
    console.log("Login Success:", r2.data.user.email);
  } catch(e) {
    console.log("Login Error:", e.response ? e.response.data : e.message);
  }
}
test();
