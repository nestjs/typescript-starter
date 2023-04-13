  Run the program:
  
    npm run start

  At Postman,
  POST
  
    http://localhost:3000/tasks
    
  click on Body -> raw -> switch Text to JSON, and enter 
  
      {
        "title": "<title>",
        "description": "<description>",
        "status": "<TODO, IN_PROGRESS, COMPLETED>"
      }

  GET
  
    http://localhost:3000/tasks
    
  click on Body -> raw -> switch Text to JSON, and enter 
  
    { "_id": "<targetId>"}

  DELETE
  
    http://localhost:3000/tasks
    
  click on Body -> raw -> switch Text to JSON, and enter 
    
    { "_id": "<targetId>"}
  
  PUT 
   
   http://localhost:3000/tasks
    
  click on Body -> raw -> switch Text to JSON, and enter 
    
    { 
      "_id": "<targetId>",
      "status": "<TODO, IN_PROGRESS, COMPLETED>"
    }
  
  Test the program:
  
    npm run test
    npm run test:watch

  
  
