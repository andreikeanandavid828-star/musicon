# Musicon UML Class Diagram

The diagram shows eight central domain concepts for Musicon. `User`, `Post`, and
`Comment` reflect fields and relationships used by the authentication and post
API code. `Profile`, `Album`, `TierList`, `Artist`, and `Song` represent other
features surfaced or implied by the application. The artist and song classes
are conceptual extensions; their attributes and persistence relationships
should be confirmed against the final database schema. The current profile API
is incomplete and the tier-list page is a placeholder.

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String username
    }

    class Profile {
        +UUID userId
        +String bio
    }

    class Album {
        +UUID id
        +String title
        +UUID artistId
    }

    class Artist {
        +UUID id
        +String name
    }

    class Song {
        +UUID id
        +UUID albumId
        +String title
        +Integer trackNumber
        +Integer durationSeconds
    }

    class Post {
        +UUID id
        +UUID userId
        +UUID albumId
        +String title
        +String body
        +DateTime createdAt
    }

    class Comment {
        +UUID id
        +UUID postId
        +UUID userId
        +UUID parentId
        +String body
        +DateTime createdAt
    }

    class TierList {
        +UUID id
        +UUID userId
        +String name
        +List~String~ rankedItems
    }

    User "1" --> "0..1" Profile : has
    User "1" --> "0..*" Post : authors
    User "1" --> "0..*" Comment : writes
    User "1" --> "0..*" TierList : creates
    Album "0..1" --> "0..*" Post : optionally linked to
    Artist "1" --> "0..*" Album : creates
    Album "1" *-- "0..*" Song : contains
    Post "1" *-- "0..*" Comment : contains
    Comment "0..1" --> "0..*" Comment : parent / replies
```
