document.addEventListener('DOMContentLoaded', () => {
  // Переключение между формами входа и регистрации
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  
  if (showRegister && showLogin) {
    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('register-container').style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-container').style.display = 'none';
      document.getElementById('login-container').style.display = 'block';
    });
  }

  // Обработка формы регистрации
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (password !== confirmPassword) {
        alert('Passwörter stimmen nicht überein!');
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
          alert('Registrierung erfolgreich! Bitte einloggen.');
          document.getElementById('register-container').style.display = 'none';
          document.getElementById('login-container').style.display = 'block';
          registerForm.reset();
        } else {
          alert(data.error || 'Registrierung fehlgeschlagen');
        }
      } catch (err) {
        console.error('Registration error:', err);
        alert('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    });
  }

  // Обработка формы входа
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('username', data.username);
          window.location.href = 'dashboard.html';
        } else {
          alert(data.error || 'Login fehlgeschlagen');
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    });
  }

  // Dashboard functionality
  if (document.getElementById('grades-form')) {
    // Загрузка данных пользователя
    async function loadUserData() {
      try {
        const response = await fetch('/api/grades/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const user = await response.json();
          document.getElementById('username-display').textContent = user.username;
          
          // Заполнение сохраненных оценок
          if (user.grades) {
            document.getElementById('semester1').value = user.grades.semester1 || '';
            document.getElementById('semester2').value = user.grades.semester2 || '';
            document.getElementById('writtenExam').value = user.grades.writtenExam || '';
            document.getElementById('oralExam').value = user.grades.oralExam || '';
            
            if (user.finalGrade) {
              updateResults(user.finalGrade, user.prognosis);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    }

    // Обновление результатов
    function updateResults(finalGrade, prognosis) {
      document.getElementById('final-grade').textContent = finalGrade;
      document.getElementById('prognosis').textContent = prognosis;
    }

    // Обработка формы оценок
    document.getElementById('grades-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const grades = {
        semester1: document.getElementById('semester1').value,
        semester2: document.getElementById('semester2').value,
        writtenExam: document.getElementById('writtenExam').value,
        oralExam: document.getElementById('oralExam').value
      };
      
      // Проверка заполнения всех полей
      for (const grade of Object.values(grades)) {
        if (!grade) {
          alert('Bitte wählen Sie alle Noten aus!');
          return;
        }
      }
      
      try {
        // Расчет оценки (локально, для отображения, сервер пересчитает)
        const gradeValues = {
          'E1': 1, 'E2': 2, 'E3': 3, 'E4': 4,
          'G2': 5, 'G3': 6, 'G4': 7, 'G5': 8, 'G6': 9
        };
        const total = 
          gradeValues[grades.semester1] * 0.3 +
          gradeValues[grades.semester2] * 0.3 +
          gradeValues[grades.writtenExam] * 0.2 +
          gradeValues[grades.oralExam] * 0.2;
        const rounded = Math.round(total);
        const finalGrade = ['E1', 'E2', 'E3', 'E4', 'G2', 'G3', 'G4', 'G5', 'G6'][rounded - 1];
        let prognosis;
        if (rounded <= 4) {
          prognosis = 'Oberstufe Prognose';
        } else if (rounded === 5) {
          prognosis = 'MSA Prognose';
        } else {
          prognosis = 'ESA Prognose';
        }
        
        // Сохранение в базу данных
        const response = await fetch('/api/grades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            grades,
            finalGrade,
            prognosis
          })
        });
        
        const data = await response.json();
        if (response.ok) {
          updateResults(finalGrade, prognosis);
          alert('Berechnung erfolgreich!');
        } else {
          alert(data.error || 'Fehler beim Speichern der Noten');
        }
      } catch (err) {
        console.error('Failed to calculate grades:', err);
        alert('Fehler bei der Berechnung');
      }
    });

    // Выход из системы
    document.getElementById('logout').addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = 'index.html';
    });

    // Инициализация
    if (!localStorage.getItem('token')) {
      window.location.href = 'index.html';
    } else {
      loadUserData();
    }
  }
});