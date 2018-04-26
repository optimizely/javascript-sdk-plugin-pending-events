import { expect } from 'chai';
import sinon from 'sinon';

import Plugin from '../src/index';

describe('PendingEventsPlugin', () => {
  const testKey = 'optimizelyLocalStorageTest';
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub(window, 'fetch').returns(Promise.resolve());
  });

  afterEach(() => {
    fetchStub.restore();
    removeData();
  });

  describe('default', () => {
    it('returns an object with dispatchEvent', () => {
      const plugin = createInstance();
      expect(plugin).to.be.an('object');
      expect(plugin.dispatchEvent).to.be.a('function');
    });

    context('when localStorageKey has no data', () => {
      let plugin;

      beforeEach(() => {
        plugin = createInstance();
      });

      it('does not enqueue any events', () => {
        sinon.assert.notCalled(fetchStub);
      });

      it('persists an empty object', () => {
        assertPersisted({});
      });
    });

    context('when localStorage key has malformed data', () => {
      let plugin;

      beforeEach(() => {
        localStorage.setItem(testKey, 'invalid data');
        plugin = createInstance();
      });

      it('does not enqueue any events', () => {
        sinon.assert.notCalled(fetchStub);
      });

      it('persists an empty object', () => {
        assertPersisted({});
      });
    });

    context('when localStorageKey has data', () => {
      let plugin;
      const testEvent = {
        url: 'foo',
        httpVerb: 'post',
        params: {},
      };

      context('with a single event', () => {
        beforeEach(() => {
          persistData({
            0: testEvent
          });
          plugin = createInstance();
        });

        it('enqueues events for the existing data', () => {
          sinon.assert.calledOnce(fetchStub);
          assertSentEvent(testEvent);
        });

        it('stores enqueued events in localStorage', () => {
          assertPersisted({0: testEvent});
        });
      });

      context('when existing data has gaps', () => {
        const testEvent1 = {
          url: 'foo',
          httpVerb: 'post',
          params: {},
        };

        const testEvent2 = {
          url: 'bar',
          httpVerb: 'post',
          params: {
            a: 'true',
          },
        };

        beforeEach(() => {
          persistData({
            2: testEvent1,
            20: testEvent2,
          });
          plugin = createInstance();
        });

        it('enqueues all data', () => {
          [testEvent1, testEvent2].forEach(assertSentEvent);
        });

        it('reindexes data', () => {
          const persistedData = getPersistedData();
          expect(Object.keys(persistedData).sort()).to.eql(['0', '1']);
          expect(Object.values(persistedData).sort()).to.eql([testEvent1, testEvent2].sort());
        });
      });
    });
  });

  describe('#dispatchEvent', () => {
    let plugin;
    const testEvent = {
      url: 'foo',
      httpVerb: 'post',
      params: {},
    };

    beforeEach(() => {
      plugin = createInstance();
    });

    it('enqueues the event', () => {
      plugin.dispatchEvent(testEvent);
      assertSentEvent(testEvent);
    });

    it('persists the data', () => {
      plugin.dispatchEvent(testEvent);
      assertPersisted({0: testEvent});
    });

    context('while fetch is pending', () => {
      beforeEach(() => {
        fetchStub.returns(new Promise((resolve) => {}));
        plugin.dispatchEvent(testEvent);
      });

      it('keeps the data persisted', () => {
        assertPersisted({0: testEvent});
      });
    });

    context('when fetch is successful', () => {
      let fetchResolved;

      beforeEach(() => {
        fetchResolved = Promise.resolve();
        fetchStub.returns(fetchResolved);
        plugin.dispatchEvent(testEvent);
      });

      it('dequeues the event', () => {
        return fetchResolved.then(() => assertPersisted({}));
      });
    });

    context('when fetch fails', () => {
      let fetchFailed;
      let fetchError;

      beforeEach(() => {
        fetchError = new Error('oh noes');
        fetchFailed = Promise.reject(fetchError);
        fetchStub.returns(fetchFailed);
        plugin.dispatchEvent(testEvent);
      });

      it('does not dequeue the event', () => {
        return fetchFailed.catch(() => assertPersisted({0: testEvent}));
      });
    });

    context('when many events are dispatched', () => {
      const totalEvents = 100;
      const cloneEvent = (i) => Object.assign({}, testEvent, {
        params: {
          i,
        }
      });

      beforeEach(() => {
        for (let i=0; i < totalEvents; i++) {
          plugin.dispatchEvent(cloneEvent(i));
        }
      });

      it('enqueues them all', () => {
        for (let i=0; i < totalEvents; i++) {
          assertSentEvent(cloneEvent(i));
        }
      });

      it('persists event data', () => {
        let expected = {};
        for (let i=0; i < totalEvents; i++) {
          expected[i] = cloneEvent(i);
        }

        assertPersisted(expected);
      });
    });
  });

  const assertSentEvent = (testEvent) => {
    sinon.assert.calledWithExactly(fetchStub, testEvent.url, {
      method: testEvent.httpVerb,
      body: JSON.stringify(testEvent.params),
      headers: {'content-type': 'application/json'},
    });
  }

  const persistData = (data) => {
    localStorage.setItem(testKey, JSON.stringify(data));
  };

  const removeData = () => localStorage.removeItem(testKey);

  const getPersistedData = () => JSON.parse(localStorage.getItem(testKey));

  const assertPersisted = (data) => {
    expect(getPersistedData()).to.eql(data);
  };

  const createInstance = () => Plugin(testKey);
});
