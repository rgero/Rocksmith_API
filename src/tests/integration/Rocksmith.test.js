const request = require('supertest');
const {Song} = require('../../models/Song');
const {parseParam} = require('../../routes/Rocksmith');

let server;
let songDic;
let rocksmithKey;
let inputParams;

describe("PUT tests for /", ()=> {

    beforeEach( async ()=> {
        server = require('../../RocksmithManager');
        rocksmithKey = "sillygoose";
        songDic = {
            artist: "Roy G",
            name: "Song Awesome",
            leadTuning: "E Standard",
            rhythmTuning: "G Standard",
            bassTuning: "Drop D"
        };
        inputParams = {
            key: rocksmithKey,
            songs: songDic
        }
    })
    afterEach(async () => { 
        await Song.deleteMany({});
        await server.close(); 
    });

    const executeRequest = async () => {
        return await request(server)
          .put('/api')
          .send(inputParams);
      }
  
    test("User doesn't supply authkey, should get 401", async ()=>{
        delete inputParams.key;
        let result = await executeRequest();
        expect(result.status).toBe(401);
    })

    test("User provides wrong key, should get 400", async ()=>{
        inputParams.key = "asidnasidnasidnas";
        let result = await executeRequest();

        expect(result.status).toBe(400);
    })

    test("User doesn't supply song, should get 400", async ()=>{
        delete inputParams.songs;
        let result = await executeRequest();
        expect(result.status).toBe(400);
    })

    test("User submits single song", async ()=> {
        var result = await executeRequest();
        expect(result.status).toBe(200);
    })

    test("User submits single song, check it is saved.", async ()=> {
        var result = await executeRequest();
        expect(result.status).toBe(200);

        var songInDB = Song.findOne(songDic);
        expect(songInDB).not.toBeNull();
    })

    test("User submits multiple song", async ()=> {
        inputParams.songs = [ songDic, songDic, songDic]
        var result = await executeRequest();
        expect(result.status).toBe(200);
    })

    test("User submits multiple song, check if saved", async ()=> {
        inputParams.songs = [ songDic, songDic, songDic]
        var result = await executeRequest();
        var songsInDB = Song.countDocuments(songDic);
        expect(songsInDB).not.toBeNull();
    })

    test("User submits invalid song, should return status 400", async ()=> {
        var tempSong = songDic;
        delete tempSong.leadTuning;
        inputParams.songs = tempSong;    
        var result = await executeRequest();
        expect(result.status).toBe(400);
    })

    test("User submits invalid song in array, should return status 400", async ()=> {
        var tempSong = songDic;
        delete tempSong.leadTuning;
        inputParams.songs = [songDic, tempSong];    
        var result = await executeRequest();
        expect(result.status).toBe(400);
    })
})

describe("GET Tests for /", ()=> {

    beforeEach( async ()=> {
        server = require('../../RocksmithManager');
        testSongArray = [
            {
                artist: "Roy G",
                name: "Song Awesome",
                leadTuning: "E Standard",
                rhythmTuning: "G Standard",
                bassTuning: "Drop D"
            },
            {
                artist: "Roy G",
                name: "Not",
                leadTuning: "B Standard",
                rhythmTuning: "C Standard",
                bassTuning: "Drop B"
            },
            {
                artist: "Roy G",
                name: "Song Awesome 2",
                leadTuning: "E Standard",
                rhythmTuning: "E Standard",
                bassTuning: "E Standard"
            },
            {
                artist: "Steve",
                name: "Song Awesome",
                leadTuning: "E Standard",
                rhythmTuning: "F Standard",
                bassTuning: "Drop A"
            },
        ];
        testSongArray.forEach( async (songDic) => {
            var testSong = new Song(songDic);
            await testSong.save();
        })
    })
    afterEach(async () => { 
        await Song.deleteMany({});
        await server.close(); 
    });

    test("No Input Params, status 200 should be returned", async ()=> {
        const res = await request(server).get('/api');
        expect(res.status).toBe(200);
    })

    test("No Input Params, status 200 should be returned", async ()=> {
        const res = await request(server).get('/api');
        var songOne = '{"artist":"Roy G","name":"Song Awesome","leadTuning":"E Standard","rhythmTuning":"G Standard","bassTuning":"Drop D"}';
        expect(res.text).not.toBeNull();
        expect(res.text).toContain(songOne)
    })



})