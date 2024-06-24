import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { ModelInstance } from 'ember-cli-mirage';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { TestContext } from 'ember-test-helpers';
import { module, test } from 'qunit';
import sinon, { SinonSpy } from 'sinon';

import ExternalStorageServiceModel from 'ember-osf-web/models/external-storage-service';
import ConfiguredStorageAddonModel from 'ember-osf-web/models/configured-storage-addon';

interface ThisTestContext extends TestContext {
    configuredAddon: ConfiguredStorageAddonModel;
    onSave: SinonSpy;
    onCancel: SinonSpy;
}

module('Integration | Component | addons-service | root-folder-picker', function(this: ThisTestContext, hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);
    setupIntl(hooks);

    test('it loads and saves', async function(this: ThisTestContext, assert) {
        const store = this.owner.lookup('service:store');
        server.loadFixtures('external-storage-services');
        const boxAddon = server.schema.externalStorageServices
            .find('box') as ModelInstance<ExternalStorageServiceModel>;
        const userRef = server.create('user-reference');
        const resourceRef = server.create('resource-reference');
        const boxAccount = server.create('authorized-storage-account', {
            displayName: 'My Box Account',
            externalStorageService: boxAddon,
            accountOwner: userRef,
            credentialsAvailable: true,
        });

        const mirageConfiguredAddon = server.create('configured-storage-addon', {
            rootFolder: 'rooty',
            externalStorageService: boxAddon,
            accountOwner: userRef,
            authorizedResource:  resourceRef,
            baseAccount: boxAccount,
        });
        const configuredAddon = await store.findRecord('configured-storage-addon', mirageConfiguredAddon.id);
        this.configuredAddon = configuredAddon;
        this.onSave = sinon.fake();
        this.onCancel = sinon.fake();
        await render(hbs`
<AddonsService::RootFolderPicker
    @configuredStorageAddon={{this.configuredAddon}}
    @onSave={{this.onSave}}
    @onCancel={{this.onCancel}}
/>
        `);

        assert.dom('[data-test-folder-path-option]').exists({ count: 1 }, 'Has root folder path option');
        assert.dom('[data-test-folder-link]').exists({ count: 5 }, 'Root folder has 5 folders');
        assert.dom('[data-test-root-folder-option]').exists({ count: 5 }, 'Checkbox available for each folder option');
        assert.dom('[data-test-root-folder-save]').isDisabled('Save button is disabled');

        // Navigate into a folder
        const folderLinks = this.element.querySelectorAll('[data-test-folder-link]');
        await click(folderLinks[0]);
        assert.dom('[data-test-folder-path-option]').exists({ count: 2 }, 'Has root folder and subfolder path option');

        // Navigate back to root
        const navButtons = this.element.querySelectorAll('[data-test-folder-path-option]');
        await click(navButtons[0]);
        assert.dom('[data-test-folder-path-option]').exists({ count: 1 }, 'Just root folder path option');

        // Select a root folder
        const folderOptions = this.element.querySelectorAll('[data-test-root-folder-option]');
        await click(folderOptions[0]);
        assert.dom('[data-test-root-folder-save]').isEnabled('Save button is enabled');

        // Save
        await click('[data-test-root-folder-save]');
        assert.ok(this.onSave.calledOnceWith('rooty-1'), 'Save action was called with selected folder id');
    });
});
