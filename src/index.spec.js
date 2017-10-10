import { persistStore, getInitialState } from './index';

describe('persistStore', () => {
  it('should works with default config', () => {
    const mockStore = {
      subscribe: jest.fn(),
      getState: () => ({})
    };
    const spy = jest.spyOn(localStorage, 'setItem');
    persistStore(mockStore);
    expect(mockStore.subscribe).toHaveBeenCalled();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should save correctly from state change', () => {
    const mockStore = {
      subscribe: jest.fn(cb => cb()),
      getState: () => ({
        test: {
          name: 'hello'
        }
      })
    };
    const config = {
      list: [
        {
          path: 'test.name'
        }
      ]
    };
    const spyGet = jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      return 'hellos';
    });
    const spySet = jest.spyOn(localStorage, 'setItem');
    persistStore(mockStore, config);
    expect(mockStore.subscribe).toHaveBeenCalled();
    expect(spySet).toHaveBeenCalledWith('test-name', 'hello');
    spyGet.mockReset();
    spySet.mockReset();
  });

  it('should save array type correctly', () => {
    const mockStore = {
      subscribe: jest.fn(cb => cb()),
      getState: () => ({
        test: {
          mylist: [1, 2, 3]
        }
      })
    };
    const config = {
      list: [
        {
          path: 'test.mylist'
        }
      ]
    };
    const spyGet = jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      return '';
    });
    const spySet = jest.spyOn(localStorage, 'setItem');
    persistStore(mockStore, config);
    expect(mockStore.subscribe).toHaveBeenCalled();
    expect(spySet).toHaveBeenCalledWith('test-mylist', '[1,2,3]');
    spyGet.mockReset();
    spySet.mockReset();
  });

  it('should not save if value is still same', () => {
    const mockStore = {
      subscribe: jest.fn(cb => cb()),
      getState: () => ({
        test: {
          name: 'hello'
        }
      })
    };
    const config = {
      list: [
        {
          path: 'test.name'
        }
      ]
    };
    const spyGet = jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      return 'hello';
    });
    const spySet = jest.spyOn(localStorage, 'setItem');
    persistStore(mockStore, config);
    expect(mockStore.subscribe).toHaveBeenCalled();
    expect(spySet).not.toHaveBeenCalled();
    spyGet.mockReset();
    spySet.mockReset();
  });

  it('should save multiple paths correctly', () => {
    const mockStore = {
      subscribe: jest.fn(cb => cb()),
      getState: () => ({
        test: {
          name: 'hello',
          lang: 'en'
        }
      })
    };
    const config = {
      list: [
        {
          path: 'test.name'
        },
        {
          path: 'test.lang'
        }
      ]
    };
    const spyGet = jest.spyOn(localStorage, 'getItem').mockImplementation(p => {
      switch (p) {
      case 'test-name':
        return 'hello';
      case 'test-lang':
        return 'id';
      }
      return '';
    });
    const spySet = jest.spyOn(localStorage, 'setItem');
    persistStore(mockStore, config);
    expect(mockStore.subscribe).toHaveBeenCalled();
    expect(spySet).toHaveBeenCalledTimes(1);
    expect(spySet).toHaveBeenCalledWith('test-lang', 'en');
    spyGet.mockReset();
    spySet.mockReset();
  });
});

describe('getInitialState', () => {
  it('should return state with default config', () => {
    const state = getInitialState();
    expect(state).toEqual({});
  });

  it('should correctly return state from config', () => {
    const config = {
      list: [
        { path: 'test.name' }
      ]
    };
    jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      return 'HelloTest';
    });
    const state = getInitialState(config);
    expect(state).toEqual({
      test: {
        name: 'HelloTest'
      }
    });
  });

  it('should correctly return state from config with array type', () => {
    const config = {
      list: [
        { path: 'test.myList', isArray: true }
      ]
    };
    jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      return '[1, 2, 3]';
    });
    const state = getInitialState(config);
    expect(state).toEqual({
      test: {
        myList: [1, 2, 3]
      }
    });
  });

  it('should correctly return state from multiple shallow or deep paths', () => {
    const config = {
      list: [
        { path: 'test.myList', isArray: true },
        { path: 'test.name' },
        { path: 'testother.deep.name' }
      ]
    };
    jest.spyOn(localStorage, 'getItem').mockImplementation((p) => {
      switch (p) {
      case 'test-myList':
        return '[1, 2, 3]';
      case 'test-name':
        return 'HelloTest';
      case 'testother-deep-name':
        return 'OtherTest';
      }
      return '';
    });
    const state = getInitialState(config);
    expect(state).toEqual({
      test: {
        myList: [1, 2, 3],
        name: 'HelloTest'
      },
      testother: {
        deep: {
          name: 'OtherTest'
        }
      }
    });
  });
});
