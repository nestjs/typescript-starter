Public class Weapon extends GameObject
{
  public boolean visibility; 

  public void powerUp(PowerUpVisitor v)
  {
    v.alterBehavior(this);
  }
  public void setVisibility(boolean v)
  {
    this.visibility=v;
  } 
}