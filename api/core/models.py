from django.db import models
from django.contrib.auth.models import User

from .query import PlayerQuerySet
from .util import Move


class Player(User):
    """
    Proxy for the User model. Should be used any time a User is referred to in
    the context of a match.
    """

    objects = PlayerQuerySet.as_manager()

    class Meta:
        proxy = True


class AbstractPlayerMatch(models.Model):
    player = models.ForeignKey(Player, on_delete=models.PROTECT)
    player_num = models.IntegerField()

    class Meta:
        abstract = True
        ordering = ("player_num",)
        unique_together = (("player", "match"), ("player_num", "match"))


class AbstractGame(models.Model):
    # zero-indexed
    game_num = models.PositiveSmallIntegerField()
    # Null for ties
    winner = models.ForeignKey(
        Player,
        related_name="%(class)s_wins",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )

    class Meta:
        abstract = True
        ordering = ("match_id", "game_num")
        unique_together = ("game_num", "match")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class AbstractPlayerGame(models.Model):
    player_num = models.IntegerField()
    player = models.ForeignKey(Player, on_delete=models.PROTECT)
    move = models.CharField(choices=Move.choices(), max_length=20)

    class Meta:
        abstract = True
        ordering = ("player_num",)
        unique_together = (("player", "game"), ("player_num", "game"))

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class MatchConfig(models.Model):
    """
    Static configuration fields for a match. These fields are set when the
    match is created and will never change. Used by both Match and LiveMatch.
    """

    best_of = models.PositiveSmallIntegerField()
    extended_mode = models.BooleanField()
    public = models.BooleanField()


class Match(models.Model):
    start_time = models.DateTimeField()
    duration = models.PositiveIntegerField()  # Seconds
    config = models.ForeignKey(MatchConfig, on_delete=models.PROTECT)
    rematch = models.OneToOneField(
        "self",
        on_delete=models.SET_NULL,
        related_name="parent",
        null=True,
        blank=True,
    )
    # Always len=2
    players = models.ManyToManyField(
        Player, through="PlayerMatch", related_name="matches"
    )
    winner = models.ForeignKey(
        Player, related_name="match_wins", on_delete=models.PROTECT
    )

    class Meta:
        ordering = ("-start_time",)


class PlayerMatch(AbstractPlayerMatch):
    match = models.ForeignKey(Match, on_delete=models.CASCADE)


class Game(AbstractGame):
    match = models.ForeignKey(
        Match, on_delete=models.CASCADE, related_name="games"
    )
    # Always len=2
    players = models.ManyToManyField(Player, through="PlayerGame")


class PlayerGame(AbstractPlayerGame):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
