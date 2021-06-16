

Public class Player extends GameObject{
  public int speed;
  public boolean visibility;
  ArrayList<GameObject> objects = new ArrayList<GameObject>;

  public void powerUp(PowerUpVisitor v){
    //Aplicar al player
    v.alterBehavior(this);
    //Aplicar a todos los objetos
    for (GameObject objects:object) object.powerUp(v);
  }
  
  
  public void setSpeed(int s){
    //vacio
  }
  public void setvisibility (boolean v){
    //vacio
  }
}

