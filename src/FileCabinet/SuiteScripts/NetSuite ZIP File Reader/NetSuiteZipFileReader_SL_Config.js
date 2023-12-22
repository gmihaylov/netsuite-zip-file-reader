/**
 * @NApiVersion 2.1
 */
define([],

    () => {

            const PARAMETERS = {
                    APP: {},
                    SCRIPT_PARAMETERS: {},
                    SUITELET: {
                            FIELDS: {},
                            BUTTONS: {},
                            FIELDGROUPS: {}
                    }
            };

            // App
            PARAMETERS.APP.NAME = 'NetSuite ZIP File Reader';

            // Script Parameters
            PARAMETERS.SCRIPT_PARAMETERS.TEMPORARY_FOLDER_FOR_ZIP_FILES =
                'custscript_ns_zip_file_reader_sl_zip_tmp';

            // Suitelet / GET
            PARAMETERS.SUITELET.FIELDS.FILE = {
                    ID: 'custpage_file',
                    LABEL: 'File'
            }

            PARAMETERS.SUITELET.BUTTONS.UNZIP = {
                    LABEL: 'Unzip'
            }

            // Suitelet / POST
            PARAMETERS.SUITELET.FIELDGROUPS.ZIP_FILE_INFORMATION = {
                    ID: 'custgroup_zip_file_information',
                    LABEL: 'ZIP File Information:'
            }

            PARAMETERS.SUITELET.FIELDGROUPS.UNZIPPED_FILES_INFORMATION = {
                    ID: 'custgroup_unzipped_files_information',
                    LABEL: 'Unzipped Files Information:'
            }

            PARAMETERS.SUITELET.FIELDS.FILENAME = {
                    ID: 'custpage_filename',
                    LABEL: 'Filename'
            }

            PARAMETERS.SUITELET.FIELDS.FILESIZE = {
                    ID: 'custpage_filesize',
                    LABEL: 'Filesize'
            }

            PARAMETERS.SUITELET.FIELDS.UNZIPPED_FILES_COUNT = {
                    ID: 'custpage_unzipped_files_count',
                    LABEL: 'Unzipped Files Count:'
            }

            PARAMETERS.SUITELET.FIELDS.UNZIPPED_FILES = {
                    ID: 'custpage_unzipped_files',
                    LABEL: 'Unzipped Files'
            }

            return PARAMETERS;

    });
