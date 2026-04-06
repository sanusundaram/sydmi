const axios = require('axios');

async function test() {
  try {
    // 1. login as tester2@test.com (teacher if they registered as such, let's login first)
    // Actually, let's just make a new fresh teacher account to be safe.
    const uniqueEmail = `teacher_${Date.now()}@test.com`;
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Teacher Test', email: uniqueEmail, password: 'password', role: 'teacher'
    });
    const token = regRes.data.token;

    // 2. create quiz
    const quizPayload = {
      title: "Test Quiz",
      subject: "Test Subject",
      description: "Test Desc",
      timeLimit: 30,
      passingScore: 60,
      difficulty: "intermediate",
      isPublished: true,
      questions: [{
        text: "What is 2+2?",
        options: ["1", "2", "3", "4"],
        correctAnswer: 3,
        topic: "Math",
        explanation: "Simple addition",
        difficulty: "medium"
      }]
    };

    const qRes = await axios.post('http://localhost:5000/api/quizzes', quizPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", qRes.data);
  } catch (err) {
    if (err.response) {
      console.log("API ERROR:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.log("NETWORK ERROR:", err.message);
    }
  }
}
test();
