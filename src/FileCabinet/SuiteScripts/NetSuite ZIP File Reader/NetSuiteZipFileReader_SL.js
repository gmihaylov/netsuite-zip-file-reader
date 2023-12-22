/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'N/ui/serverWidget',
        './NetSuiteZipFileReader_SL_Config',
        './lib/jszip-sync.min',
        'N/runtime',
        'N/log',
        'N/error',
        'N/file'
    ],

    (
        ui,
        CONFIG,
        jszip,
        runtime,
        log,
        error,
        file) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if(scriptContext.request.method === 'GET') {
                const form = ui.createForm({
                    title: CONFIG.APP.NAME,
                    hideNavBar: false
                });

                const fileFld = form.addField({
                    id: CONFIG.SUITELET.FIELDS.FILE.ID,
                    type: ui.FieldType.FILE,
                    label: CONFIG.SUITELET.FIELDS.FILE.LABEL
                });

                form.addSubmitButton(CONFIG.SUITELET.BUTTONS.UNZIP.LABEL);

                scriptContext.response.writePage(form);
            }

            if(scriptContext.request.method === 'POST') {
                const postParameters = getPostParameters(scriptContext.request);
                const scriptParameters = getScriptParameters();
                const zipFile = saveFile(
                    postParameters.file,
                    scriptParameters[CONFIG.SCRIPT_PARAMETERS.TEMPORARY_FOLDER_FOR_ZIP_FILES]
                );
                const unzippedFiles = unzipFile(zipFile);

                const form = ui.createForm({
                    title: CONFIG.APP.NAME,
                    hideNavBar: false
                });

                form.addFieldGroup({
                    id : CONFIG.SUITELET.FIELDGROUPS.ZIP_FILE_INFORMATION.ID,
                    label : CONFIG.SUITELET.FIELDGROUPS.ZIP_FILE_INFORMATION.LABEL
                });

                form.addFieldGroup({
                    id : CONFIG.SUITELET.FIELDGROUPS.UNZIPPED_FILES_INFORMATION.ID,
                    label : CONFIG.SUITELET.FIELDGROUPS.UNZIPPED_FILES_INFORMATION.LABEL
                });


                const filenameFld = form.addField({
                    id: CONFIG.SUITELET.FIELDS.FILENAME.ID,
                    type: ui.FieldType.TEXT,
                    label: CONFIG.SUITELET.FIELDS.FILENAME.LABEL,
                    container: CONFIG.SUITELET.FIELDGROUPS.ZIP_FILE_INFORMATION.ID
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.INLINE
                }).defaultValue = postParameters.file.name;

                const filesizeFld = form.addField({
                    id: CONFIG.SUITELET.FIELDS.FILESIZE.ID,
                    type: ui.FieldType.TEXT,
                    label: CONFIG.SUITELET.FIELDS.FILESIZE.LABEL,
                    container: CONFIG.SUITELET.FIELDGROUPS.ZIP_FILE_INFORMATION.ID
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.INLINE
                }).defaultValue = `${postParameters.file.size} bytes`;

                const unzippedFilesCountFld = form.addField({
                    id: CONFIG.SUITELET.FIELDS.UNZIPPED_FILES_COUNT.ID,
                    type: ui.FieldType.LONGTEXT,
                    label: CONFIG.SUITELET.FIELDS.UNZIPPED_FILES_COUNT.LABEL,
                    container: CONFIG.SUITELET.FIELDGROUPS.ZIP_FILE_INFORMATION.ID
                }).updateDisplayType({
                    displayType: ui.FieldDisplayType.INLINE
                }).defaultValue = unzippedFiles.length;


                form.addField({
                    id: CONFIG.SUITELET.FIELDS.UNZIPPED_FILES.ID,
                    type: ui.FieldType.INLINEHTML,
                    label: CONFIG.SUITELET.FIELDS.UNZIPPED_FILES.LABEL,
                    container: CONFIG.SUITELET.FIELDGROUPS.UNZIPPED_FILES_INFORMATION.ID
                }).defaultValue = unzippedFilesTable(unzippedFiles)

                scriptContext.response.writePage(form);
            }
        }

        const unzippedFilesTable = (unzippedFiles) => {
            let html = `<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">`
            html += '<table class="w3-table-all w3-card-4" style="margin-top: 20px; font-size: 16px;">'
            html += '<tr>';
            html += '<th>Filename:</th>'
            html += '<th>Filesize:</th>'
            html += '<th>File Content:</th>'
            html += '</tr>';
            unzippedFiles.forEach(function (file) {
                html += '<tr>';
                html += `<td>${file.name}</td>`
                html += `<td>${file.size}</td>`
                html += `<td>${file.content}</td>`
                html += '</tr>'
            });
            html += '</table>';
            return html;
        }

        const getPostParameters = (request) => {
            const parameters = {
                file: null
            };

            parameters.file = request.files[CONFIG.SUITELET.FIELDS.FILE.ID];

            return parameters;
        }

        const unzipFile = (fileId) => {
            const zippedFile = file.load({id: fileId});
            const zippedFileContent = zippedFile.getContents();
            const unzippedFiles = [];

            const ZipInstance = new jszip();

            ZipInstance.sync(function () {
                ZipInstance.loadAsync(zippedFileContent, {base64: true}).then(function (zip) {
                    Object.keys(zip.files).forEach(function(filename){
                        const file =  zip.file(filename).async("string");

                        unzippedFiles.push({
                            name: filename,
                            content: file._result,
                            size: file._result.length
                        })

                    });
                })
            });

            return unzippedFiles;
        }

        const getScriptParameters = () => {
            let parameters = {};
            const script = runtime.getCurrentScript();

            parameters[CONFIG.SCRIPT_PARAMETERS.TEMPORARY_FOLDER_FOR_ZIP_FILES] =
                script.getParameter({name: CONFIG.SCRIPT_PARAMETERS.TEMPORARY_FOLDER_FOR_ZIP_FILES});

            if(isEmpty(parameters[CONFIG.SCRIPT_PARAMETERS.TEMPORARY_FOLDER_FOR_ZIP_FILES])) {
                throw new error.create({
                    name: 'INVALID_PARAMETER',
                    message: 'The ' +
                        CONFIG.SCRIPT_PARAMETERS.TEMPORARY_FOLDER_FOR_ZIP_FILES +
                        ' script parameter is not in a valid format.',
                    notifyOff: false
                });
            }

            log.debug({
                title: CONFIG.APP.NAME,
                details: 'Script Parameters: ' + JSON.stringify(parameters)
            });

            return parameters;
        }

        const saveFile = (fileObj, folderId) => {
            if(!folderId) throw new error.create({
                name: 'INVALID_FOLDER_ID',
                message: 'The folder id is not supplied!',
                notifyOff: false
            });

            fileObj.folder = folderId;
            return fileObj.save();
        }

        const isEmpty = (f) => {
            return (f==null||f=='');
        }

        return {onRequest}

    });
