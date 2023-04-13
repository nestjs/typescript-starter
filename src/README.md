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

  Note: 
  1. PUT requests are not covered in integration test.
  2. Tried to unit test for insertTask in tasks.service but failed due to failure in mocking save() method.
  
  Reference:
  
  https://github.com/mguay22/nestjs-mongo/tree/e2e-finish
  
  https://github.com/mguay22/nestjs-mongo/tree/unit-testing
  
  https://www.youtube.com/watch?v=ulfU5vY6I78&ab_channel=Academind
