Public class PowerUpSpeed extends PowerUpVisitor{

  public void alterBehavior(Player p){
    p.setVisibility(!p.visibility);
  }

  public void alterBehavior(Weapon a){
    a.setVisibility(!a.visibility);
  }
}