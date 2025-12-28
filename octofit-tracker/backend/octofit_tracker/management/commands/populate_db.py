from django.core.management.base import BaseCommand
from octofit_tracker.models import User, Team, Activity, Leaderboard, Workout

class Command(BaseCommand):
    help = 'Populate the octofit_db database with test data'

    def handle(self, *args, **kwargs):
        # Delete existing data safely (avoid deleting instances without PK which raises)
        for obj in Activity.objects.all():
            if getattr(obj, 'pk', None):
                obj.delete()
        for obj in Workout.objects.all():
            if getattr(obj, 'pk', None):
                obj.delete()
        for obj in Leaderboard.objects.all():
            if getattr(obj, 'pk', None):
                obj.delete()
        for obj in Team.objects.all():
            if getattr(obj, 'pk', None):
                obj.delete()
        # Note: do not delete Users (or delete selectively) to avoid removing admin

        # Create teams
        marvel, _ = Team.objects.get_or_create(name='Marvel')
        dc, _ = Team.objects.get_or_create(name='DC')

        # Create users (use create_user pattern but avoid duplicates)
        ironman, created = User.objects.get_or_create(username='ironman', defaults={'email':'ironman@marvel.com'})
        if created:
            ironman.set_password('pass'); ironman.save()
        captain, created = User.objects.get_or_create(username='captain', defaults={'email':'cap@marvel.com'})
        if created:
            captain.set_password('pass'); captain.save()
        batman, created = User.objects.get_or_create(username='batman', defaults={'email':'batman@dc.com'})
        if created:
            batman.set_password('pass'); batman.save()
        superman, created = User.objects.get_or_create(username='superman', defaults={'email':'superman@dc.com'})
        if created:
            superman.set_password('pass'); superman.save()

        # Add users to teams by creating through-model instances individually
        # If running with Django ORM (SQLite), add members.
        try:
            marvel.members.add(ironman, captain)
            dc.members.add(batman, superman)
        except Exception:
            # If M2M fails (e.g., using Djongo), skip adding members
            pass

        # Create activities
        Activity.objects.create(user=ironman, type='Run', duration=30)
        Activity.objects.create(user=captain, type='Swim', duration=45)
        Activity.objects.create(user=batman, type='Cycle', duration=60)
        Activity.objects.create(user=superman, type='Yoga', duration=20)

        # Create workouts (assign to users)
        Workout.objects.create(user=ironman, name='Morning Cardio', description='Cardio for heroes')
        Workout.objects.create(user=captain, name='Strength Training', description='Strength for heroes')

        # Create leaderboard entries for teams
        Leaderboard.objects.create(team=marvel, score=190)
        Leaderboard.objects.create(team=dc, score=180)
        self.stdout.write(self.style.SUCCESS('octofit_db populated with test data'))
