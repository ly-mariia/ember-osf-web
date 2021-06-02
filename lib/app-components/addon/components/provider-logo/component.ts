import { tagName } from '@ember-decorators/component';
import Component from '@ember/component';
import { alias, and } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import { layout } from 'ember-osf-web/decorators/component';
import Provider from 'ember-osf-web/models/provider';
import Analytics from 'ember-osf-web/services/analytics';
import styles from './styles';
import template from './template';

@layout(template, styles)
@tagName('')
export default class ProviderLogo extends Component {
    @service analytics!: Analytics;

    provider!: Provider;

    @and('provider.domain', 'provider.domainRedirectEnabled')
    useExternalLink!: boolean;

    @alias('provider.assets.square_color_no_transparent')
    logoAsset!: string;
}
