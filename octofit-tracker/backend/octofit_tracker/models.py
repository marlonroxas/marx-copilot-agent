
from djongo import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Additional profile fields can be added here
    pass

class Team(models.Model):
    id = models.ObjectIdField(primary_key=True, editable=False)
    name = models.CharField(max_length=100, unique=True)
    members = models.ManyToManyField('User', related_name='teams')

    def __str__(self):
        return self.name

class Activity(models.Model):
    id = models.ObjectIdField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, to_field='id')
    type = models.CharField(max_length=50)
    duration = models.IntegerField()
    calories = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type}"

class Workout(models.Model):
    id = models.ObjectIdField(primary_key=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, to_field='id')
    name = models.CharField(max_length=100)
    description = models.TextField()
    personalized = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class Leaderboard(models.Model):
    id = models.ObjectIdField(primary_key=True, editable=False)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, to_field='id')
    score = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.team.name}: {self.score}"
