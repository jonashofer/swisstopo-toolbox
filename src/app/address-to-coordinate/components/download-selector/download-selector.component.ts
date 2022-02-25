import {Component} from '@angular/core';
import {DownloadService} from '../../services';

@Component({
	selector: 'app-download-selector',
	templateUrl: './download-selector.component.html',
	styleUrls: ['./download-selector.component.scss']
})
export class DownloadSelectorComponent {
	constructor(public downloadService: DownloadService) {}
}
