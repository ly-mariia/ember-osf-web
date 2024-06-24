import { ModelInstance } from 'ember-cli-mirage';

import { addonServiceAPIUrl } from 'ember-osf-web/adapters/addon-service';
import AuthorizedCitationAccount from 'ember-osf-web/models/authorized-citation-account';

import AddonServiceSerializer from './addon-service';

interface MirageAuthorizedCitationAccount extends ModelInstance<AuthorizedCitationAccount> {
    accountOwnerId: string;
    citationServiceId: string;
}

export default class AuthorizedCitationAccountSerializer extends AddonServiceSerializer<AuthorizedCitationAccount> {
    buildRelationships(model: MirageAuthorizedCitationAccount) {
        return {
            accountOwner: {
                links: {
                    related: {
                        href: `${addonServiceAPIUrl}user-references/${model.accountOwnerId}/`,
                    },
                },
                data: {
                    type: 'user-references',
                    id: model.accountOwnerId,
                },
            },
            citationService: {
                links: {
                    related: {
                        href: `${addonServiceAPIUrl}external-citation-services/${model.citationServiceId}/`,
                    },
                },
                data: {
                    type: 'external-citation-services',
                    id: model.citationServiceId,
                },
            },
        };
    }
}
