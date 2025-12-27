from django.test import TestCase
from .models import User, Team, Activity, Workout, Leaderboard

class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create(username='testuser', email='test@example.com')
        self.assertEqual(user.username, 'testuser')

class TeamModelTest(TestCase):
    def test_create_team(self):
        user = User.objects.create(username='member', email='member@example.com')
        team = Team.objects.create(name='Test Team')
        team.members.add(user)
        self.assertEqual(team.name, 'Test Team')
        self.assertIn(user, team.members.all())

class ActivityModelTest(TestCase):
    def test_create_activity(self):
        user = User.objects.create(username='active', email='active@example.com')
        activity = Activity.objects.create(user=user, type='Running', duration=30, calories=300)
        self.assertEqual(activity.type, 'Running')

class WorkoutModelTest(TestCase):
    def test_create_workout(self):
        user = User.objects.create(username='workout', email='workout@example.com')
        workout = Workout.objects.create(user=user, name='Cardio', description='30 min run', personalized=True)
        self.assertEqual(workout.name, 'Cardio')
        self.assertTrue(workout.personalized)

class LeaderboardModelTest(TestCase):
    def test_create_leaderboard(self):
        team = Team.objects.create(name='Leaderboard Team')
        leaderboard = Leaderboard.objects.create(team=team, score=100)
        self.assertEqual(leaderboard.score, 100)
