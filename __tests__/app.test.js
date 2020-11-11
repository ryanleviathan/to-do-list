require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('posts and gets Jons plants', async() => {

      const expectation = [
        {
          'id': 4,
          'name': 'take out trash',
          'priority_number': 9,
          'is_completed': false,
          'owner_id': 2
        },
        {
          'id': 5,
          'name': 'take out recycling',
          'priority_number': 6,
          'is_completed': false,
          'owner_id': 2
        },
        {
          'id': 6,
          'name': 'unload dishwasher',
          'priority_number': 5,
          'is_completed': false,
          'owner_id': 2
        }
      ];

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[0])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[1])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      await fakeRequest(app)
        .post('/api/todos')
        .send(expectation[2])
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
        
      expect(data.body).toEqual(expectation);
    });

    test('updates todo bool to true', async() => {

      const expectation =
      [{
        'id': 6,
        'name': 'unload dishwasher',
        'priority_number': 5,
        'is_completed': true,
        'owner_id': 2
      }];

      const data = await fakeRequest(app)
        .put('/api/todos/6')
        .set('Authorization', token)
        .send(expectation)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
