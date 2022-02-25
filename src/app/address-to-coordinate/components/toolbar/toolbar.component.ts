import {Component} from '@angular/core';
import {DownloadService} from '../../services';

@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
	constructor(public downloadService: DownloadService) {}
}
