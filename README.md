# **🗳️ Voting App (Backend)**
This Voting App is developed as part of backend development practice. The project includes user authentication, candidate management, and voting functionality using Node.js, Express.js, JWT, and MongoDB. It is designed to handle user roles, with regular users able to vote for their favorite candidates, and an admin responsible for managing the candidates list. The backend has been thoroughly tested using Postman, a popular API testing tool.

# **🌟 Features**
User Functionality:
🔐 User Signup & Login: Secure authentication using JWT and bcrypt.
🧑‍💻 Profile Management: Users can view and update their profile information.
🗳️ Vote for Candidates: Authenticated users can vote for the candidate of their choice.
📊 Vote Count: View the total number of votes each candidate has received.
🏆 Top Candidate: Retrieve the candidate with the highest number of votes.
Admin Functionality:
📝 Candidate Management: The admin can create, update, and delete candidates.
🚫 Role Restriction: Admin cannot vote for candidates to ensure fairness.
# **🛠️ Technologies Used**
Node.js
Express.js
JWT for secure authentication
Bcrypt for password hashing
MongoDB and Mongoose for database management
# **🧪 Postman Testing**
Since this is a backend-only project, all functionalities have been tested using Postman. Postman allows you to:

Test the API endpoints by making HTTP requests (GET, POST, PUT, DELETE).
Pass authentication tokens in the headers to simulate logged-in users.
Send request bodies for user signup, login, candidate management, and voting.
View responses in real-time to validate the correctness of your API.
# **🔮 Future Enhancements**
Build a frontend to provide a user interface for the voting functionality.
Add real-time vote count updates with WebSockets.
Expand admin features for better candidate management and analytics.
Implement email notifications for voting results or reminders.
# **📞 Contact**
If you have any queries or questions regarding this project, feel free to reach out:

📧 Email: rabeelsulehria3@gmail.com