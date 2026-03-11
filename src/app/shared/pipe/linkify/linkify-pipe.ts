import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkify',
  standalone: true,
})
export class LinkifyPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value?: string): SafeHtml {
    if (!value) return '';
    // Detect URLs (http, https, www)
    const urlRegex = /((https?:\/\/|www\.)[^\s<]+[^\s<\.)])/gi;

    const html = value
      .replace(urlRegex, (match) => {
        let url = match;
        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline break-words">${match}</a>`;
      })
      .replace(/\n/g, '<br/>');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
