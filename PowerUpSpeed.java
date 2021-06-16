Class PowerUpSpeed extends PowerUpVisitor{

  public void alterBehavior(Player p)
  {
    p.setSpeed(p.speed*2);
  }

  public void alterBehavior(Weapon a)
  {
    return null;
  }
}