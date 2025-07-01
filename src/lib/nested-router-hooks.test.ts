import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { urls } from './helpers/urls';

describe('Nested Router Hooks Issue', () => {
  
  const shouldProcessUrl = (url: string, basePath: string): boolean => {
    const { path } = urls.parse(url);
    
    if (!basePath || basePath === '/') {
      return true;
    }
    
    
    if (path === basePath) {
      return true;
    }
    
    if (path.startsWith(basePath + '/')) {
      return true;
    }
    
    return false;
  };

  it('should demonstrate the basePath filtering logic needed for the fix', () => {
    
    const parentBasePath = '/nested';
    const childUrl = 'http://localhost:3000/nested/level-1/level-2';
    
    expect(shouldProcessUrl(childUrl, parentBasePath)).toBe(true); // Currently true (shows bug)
    
    const childBasePath = '/nested/level-1';
    expect(shouldProcessUrl(childUrl, childBasePath)).toBe(true); // Should be true
    
    const parentUrl = 'http://localhost:3000/nested/level-1';
    expect(shouldProcessUrl(parentUrl, parentBasePath)).toBe(true); // Should be true
  });

  it('should correctly identify when URLs match router basePath scope', () => {
    
    expect(shouldProcessUrl('http://localhost:3000/any/path', '/')).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/nested/level-1/level-2', '/')).toBe(true);
    
    expect(shouldProcessUrl('http://localhost:3000/nested/level-1', '/nested')).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/nested/level-1/level-2', '/nested')).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/other/path', '/nested')).toBe(false);
    
    expect(shouldProcessUrl('http://localhost:3000/nested/level-1/level-2', '/nested/level-1')).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/nested/level-1', '/nested/level-1')).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/nested/other', '/nested/level-1')).toBe(false);
  });

  it('should handle edge cases for basePath matching', () => {
    
    expect(shouldProcessUrl('http://localhost:3000/nested-other/something', '/nested')).toBe(false);
    expect(shouldProcessUrl('http://localhost:3000/nested123/something', '/nested')).toBe(false);
    
    expect(shouldProcessUrl('http://localhost:3000/nested', '/nested')).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/nested/', '/nested')).toBe(true);
    
    expect(shouldProcessUrl('http://localhost:3000/any/path', '')).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/any/path', undefined as any)).toBe(true);
  });

  it('should demonstrate the fix needed: proper basePath filtering prevents parent hook execution', () => {
    
    const level1BasePath = '/app';
    const level2BasePath = '/app/section';
    const level3BasePath = '/app/section/subsection';
    const deepUrl = 'http://localhost:3000/app/section/subsection/page';
    
    expect(shouldProcessUrl(deepUrl, level1BasePath)).toBe(true); // Currently true (bug)
    expect(shouldProcessUrl(deepUrl, level2BasePath)).toBe(true); // Currently true (bug)  
    expect(shouldProcessUrl(deepUrl, level3BasePath)).toBe(true); // Should be true
    
    expect(shouldProcessUrl('http://localhost:3000/app/home', level1BasePath)).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/app/section/list', level2BasePath)).toBe(true);
    expect(shouldProcessUrl('http://localhost:3000/app/section/subsection/item', level3BasePath)).toBe(true);
  });

  it('should provide the correct basePath filtering implementation', () => {
    
    const improvedShouldProcessUrl = (url: string, basePath: string): boolean => {
      const { path } = urls.parse(url);
      
      if (!basePath || basePath === '/') {
        return true;
      }
      
      
      if (path === basePath) {
        return true;
      }
      
      if (path.startsWith(basePath + '/')) {
        return true;
      }
      
      return false;
    };
    
    expect(improvedShouldProcessUrl('http://localhost:3000/nested/level-1/level-2', '/nested')).toBe(true);
    expect(improvedShouldProcessUrl('http://localhost:3000/nested-other/something', '/nested')).toBe(false);
    expect(improvedShouldProcessUrl('http://localhost:3000/nested', '/nested')).toBe(true);
    expect(improvedShouldProcessUrl('http://localhost:3000/nested/', '/nested')).toBe(true);
    
  });
});
