import { Sanitizer } from '@angular/core';
import { LinkifyPipe } from './linkify-pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('LinkifyPipe', () => {
  it('create an instance', () => {
    const pipe = new LinkifyPipe({} as DomSanitizer);
    expect(pipe).toBeTruthy();
  });
});
