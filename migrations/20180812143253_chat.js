exports.up = knex => knex.raw(`

CREATE TABLE rooms (
  id         bigserial PRIMARY KEY,
  name       varchar(200) NOT NULL
);

INSERT INTO rooms (name) VALUES ('Auth');

CREATE TABLE messages (
  id         bigserial PRIMARY KEY,
  "userId"   bigint NOT NULL,
  "roomId"   bigint NOT NULL,
  text       varchar(2000) NOT NULL,
  CONSTRAINT messages_roomid_fkey FOREIGN KEY ("roomId")
    REFERENCES public.rooms (id) MATCH SIMPLE
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX messages_roomid_idx ON messages ("roomId");

`);

exports.down = knex => knex.raw(`

DROP TABLE messages;

DROP TABLE rooms;

`);
