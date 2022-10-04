# Matching Service

## Requirements

- Match user 1 and user 2 with similar difficulty levels
- Put users in the same room
- If valid match, should match within 30s
  - otherwise room is closed
- System should provide means for user to leave room once matched

## Question Difficulty Levels

- Easy
- Medium
- Hard

## User Flows

### No rooms found

- User 1 wants to find a match based on difficulty
- Backend looks at database to find if any room available with difficulty 
- If no rooms available, create room for user 1 with difficulty
- Frontend: redirect user into room created
- After 30 seconds, if no match found, room will be closed

### Valid room found

- User 1 is already in a room with difficulty MED
- Within less than 30s, User 2 looks for match with same difficulty
- User 1 and User 2 is matched
- Add user 2 into user 1's room
- Mark room as match found

### Leave room

- When 1 user leaves the room, the other user could either:
  - toggle room to be available for match again
  - leave the room
  
## Backend Components Required

- Room database
  - can be marked by whether it's looking for a match or not
  - users can be added or deleted from a room
  - rooms can have a question (from question-service later on)


