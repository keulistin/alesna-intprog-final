# User Management System

<h2>Project Overview</h2>

<h3>Objective</h3>
<p>To collaboratively build a full-stack user management application with Node.js/MySQL backend and Angular 17 frontend, implementing authentication, authorization, and CRUD operations.</p>

<h3>Key Features</h3>
<ul>
  <li><strong>Backend:</strong>
    <ul>
      <li>Email sign-up and verification</li>
      <li>JWT authentication with refresh tokens</li>
      <li>Role-based authorization (Admin/User)</li>
      <li>Forgot password and reset password functionality</li>
      <li>CRUD operations for account management</li>
    </ul>
  </li>
  <li><strong>Frontend:</strong>
    <ul>
      <li>User registration and email verification</li>
      <li>Login with JWT authentication</li>
      <li>Profile management</li>
      <li>Admin dashboard</li>
      <li>Fake backend for development</li>
    </ul>
  </li>
</ul>

<h2>Technologies Used</h2>
<ul>
  <li><strong>Backend:</strong> Node.js, Express, MySQL</li>
  <li><strong>Frontend:</strong> Angular 17</li>
  <li><strong>Authentication:</strong> JWT, bcrypt</li>
  <li><strong>Email:</strong> Nodemailer</li>
  <li><strong>Testing:</strong> Manual testing, security validation</li>
</ul>

<h2>Team Structure</h2>
<table>
  <tr>
    <th>Role</th>
    <th>Member</th>
  </tr>
  <tr>
    <td>Group Leader</td>
    <td>Bryl Darel Gorgonio</td>
  </tr>
  <tr>
    <td>Backend Developer 1</td>
    <td>Angela Postrero</td>
  </tr>
  <tr>
    <td>Backend Developer 2</td>
    <td>Christine Anne Alesna</td>
  </tr>
  <tr>
    <td>Frontend Developer 1</td>
    <td>Kobe Bryan Amaro</td>
  </tr>
  <tr>
    <td>Frontend Developer 2</td>
    <td>Bryl Darel Gorgonio</td>
  </tr>
  <tr>
    <td>Tester 1</td>
    <td>Christine Anne Alesna</td>
  </tr>
  <tr>
    <td>Tester 2</td>
    <td>Bryl Darel Gorgonio</td>
  </tr>
</table>

<h2>Setup Instructions</h2>

<h3>Prerequisites</h3>
<ul>
  <li>Node.js (v16+)</li>
  <li>MySQL (v8.0+)</li>
  <li>Angular CLI (v17)</li>
  <li>Git</li>
</ul>

<h3>Backend Installation</h3>
<ol>
  <li>Clone the repository:
    <pre>git clone https://github.com/BrylDG/user-management-system.git</pre>
  </li>
  <li>Navigate to backend:
    <pre>cd backend</pre>
  </li>
  <li>Install dependencies:
    <pre>npm install</pre>
  </li>
  <li>Create .env file:
    <pre>cp .env.example .env</pre>
  </li>
  <li>Configure database in .env:
    <pre>DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=user_management
JWT_SECRET=your_jwt_secret
SMTP_CONFIG=your_email_config</pre>
  </li>
  <li>Run migrations:
    <pre>npm run migrate</pre>
  </li>
  <li>Start server:
    <pre>npm start</pre>
  </li>
</ol>

<h3>Frontend Installation</h3>
<ol>
  <li>Navigate to frontend:
    <pre>cd frontend</pre>
  </li>
  <li>Install dependencies:
    <pre>npm install</pre>
  </li>
  <li>Start development server:
    <pre>ng serve</pre>
  </li>
  <li>Open in browser:
    <pre>http://localhost:4200</pre>
  </li>
</ol>

<h2>API Documentation</h2>

<h3>Authentication Endpoints</h3>
<table>
  <tr>
    <th>Endpoint</th>
    <th>Method</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>/accounts/register</code></td>
    <td>POST</td>
    <td>User registration</td>
  </tr>
  <tr>
    <td><code>/accounts/verify-email</code></td>
    <td>POST</td>
    <td>Email verification</td>
  </tr>
  <tr>
    <td><code>/accounts/authenticate</code></td>
    <td>POST</td>
    <td>User login</td>
  </tr>
  <tr>
    <td><code>/accounts/forgot-password</code></td>
    <td>POST</td>
    <td>Password reset request</td>
  </tr>
  <tr>
    <td><code>/accounts/reset-password</code></td>
    <td>POST</td>
    <td>Password reset</td>
  </tr>
</table>

<h3>User Management Endpoints</h3>
<table>
  <tr>
    <th>Endpoint</th>
    <th>Method</th>
    <th>Access</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>/accounts</code></td>
    <td>GET</td>
    <td>Admin</td>
    <td>List all users</td>
  </tr>
  <tr>
    <td><code>/accounts/{id}</code></td>
    <td>GET</td>
    <td>Owner/Admin</td>
    <td>Get user details</td>
  </tr>
  <tr>
    <td><code>/accounts/{id}</code></td>
    <td>PUT</td>
    <td>Owner/Admin</td>
    <td>Update user</td>
  </tr>
  <tr>
    <td><code>/accounts/{id}</code></td>
    <td>DELETE</td>
    <td>Admin</td>
    <td>Delete user</td>
  </tr>
</table>

<h2>Fake Backend Implementation</h2>
<ol>
  <li>Open <code>src/app/app.module.ts</code></li>
  <li>Add fake backend provider:
    <pre>import { fakeBackendProvider } from './_helpers/fake-backend';

@NgModule({
  providers: [
    fakeBackendProvider
  ]
})</pre>
  </li>
  <li>Test with frontend:
    <pre>ng serve</pre>
  </li>
</ol>

<h2>Testing</h2>

<h3>Functional Testing</h3>
<ul>
  <li>User registration flow</li>
  <li>Email verification process</li>
  <li>Login/logout functionality</li>
  <li>Profile management</li>
  <li>Admin dashboard operations</li>
</ul>

<h3>Security Testing</h3>
<ul>
  <li>SQL injection attempts</li>
  <li>XSS vulnerability checks</li>
  <li>JWT validation</li>
  <li>Role-based access control</li>
</ul>

<h2>Git Workflow</h2>
<ol>
  <li>Create feature branch:
    <pre>git checkout -b feature/your-feature</pre>
  </li>
  <li>Commit changes:
    <pre>git add .
git commit -m "Descriptive message"</pre>
  </li>
  <li>Push to remote:
    <pre>git push origin feature/your-feature</pre>
  </li>
  <li>Create pull request to main branch</li>
</ol>

<h2>Best Practices</h2>
<ul>
  <li>Commit small, focused changes</li>
  <li>Write clear commit messages</li>
  <li>Keep branches updated with main</li>
  <li>Review code before merging</li>
  <li>Document all changes</li>
</ul>

<h2>License</h2>
<p>MIT License</p>

