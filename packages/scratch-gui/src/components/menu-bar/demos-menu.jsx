import React, {useState, useEffect} from 'react';
import styles from './menu-bar.css';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import log from '../../lib/log';

import {useIntl, FormattedMessage, defineMessage} from 'react-intl';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import dropdownCaret from './dropdown-caret.svg';
import demosIcon from './icon--demos.svg';
import useMenuNavigation from '../../hooks/use-menu-navigation';

import {
    LoadingState,
    LoadingStates,
    onLoadedProject,
    requestProjectUpload
} from '../../reducers/project-state';
import {setProjectTitle} from '../../reducers/project-title';
import {
    openLoadingProject,
    closeLoadingProject
} from '../../reducers/modals';

// Demos list imported from the generated JSON
import demosList from '../../lib/demos.json';

const demosMenu = defineMessage({
    id: 'gui.aria.demosMenu',
    defaultMessage: 'Demos',
    description: 'accessibility label for demos menu'
});

const loadError = defineMessage({
    id: 'gui.projectLoader.loadError',
    defaultMessage: 'The project file that was selected failed to load.',
    description: 'An error that displays when a local project file fails to load.'
});

const DemosMenu = ({
    isRtl,
    depth,
    loadingState,
    vm,
    onLoadingStarted,
    onLoadingFinished,
    onSetProjectTitle,
    requestProjectUploadAction
}) => {
    const intl = useIntl();

    const {
        menuRef,
        isExpanded,
        handleKeyDown,
        handleKeyDownOpenMenu,
        handleOnOpen,
        handleOnClose
    } = useMenuNavigation({
        depth,
        isRtl
    });

    const handleLoadDemo = async (demoPath, demoName) => {
        requestProjectUploadAction(loadingState);
        onLoadingStarted();
        let loadingSuccess = false;

        try {
            const response = await fetch(demoPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${demoPath}`);
            }
            const arrayBuffer = await response.arrayBuffer();

            await vm.loadProject(arrayBuffer);
            onSetProjectTitle(demoName);
            loadingSuccess = true;
        } catch (error) {
            log.warn(error);
            alert(intl.formatMessage(loadError)); // eslint-disable-line no-alert
        } finally {
            onLoadingFinished(LoadingState.LOADING_VM_FILE_UPLOAD, loadingSuccess);
            handleOnClose();
        }
    };

    if (!demosList || demosList.length === 0) {
        return null; // Don't show the menu if there are no demos
    }

    return (
        <button
            className={classNames(styles.menuBarItem, styles.hoverable, {
                [styles.active]: isExpanded()
            })}
            onClick={handleOnOpen}
            aria-label={intl.formatMessage(demosMenu)}
            aria-expanded={isExpanded()}
            ref={menuRef}
            onKeyDown={handleKeyDown}
        >
            <img src={demosIcon} />
            <span className={classNames(styles.collapsibleLabel)}>
                <FormattedMessage
                    defaultMessage="Demos"
                    description="Text for demos dropdown menu"
                    id="gui.menuBar.demos"
                />
            </span>
            <img src={dropdownCaret} />
            <MenuBarMenu
                className={classNames(styles.menuBarMenu)}
                open={isExpanded()}
                place={isRtl ? 'left' : 'right'}
                onRequestClose={handleOnClose}
            >
                <MenuSection>
                    {demosList.map((demo, index) => (
                        <MenuItem
                            key={index}
                            onClick={() => handleLoadDemo(demo.path, demo.name)}
                            isDataMenuItem
                            onParentKeyDown={handleKeyDownOpenMenu}
                        >
                            {demo.name}
                        </MenuItem>
                    ))}
                </MenuSection>
            </MenuBarMenu>
        </button>
    );
};

DemosMenu.propTypes = {
    isRtl: PropTypes.bool,
    depth: PropTypes.number,
    loadingState: PropTypes.oneOf(LoadingStates),
    vm: PropTypes.shape({
        loadProject: PropTypes.func
    }).isRequired,
    onLoadingStarted: PropTypes.func.isRequired,
    onLoadingFinished: PropTypes.func.isRequired,
    onSetProjectTitle: PropTypes.func.isRequired,
    requestProjectUploadAction: PropTypes.func
};

const mapStateToProps = state => ({
    isRtl: state.locales.isRtl,
    loadingState: state.scratchGui.projectState.loadingState,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onLoadingStarted: () => dispatch(openLoadingProject()),
    onLoadingFinished: (loadingState, success) => {
        dispatch(onLoadedProject(loadingState, true, success));
        dispatch(closeLoadingProject());
    },
    onSetProjectTitle: title => dispatch(setProjectTitle(title)),
    requestProjectUploadAction: loadingState => dispatch(requestProjectUpload(loadingState))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DemosMenu);
