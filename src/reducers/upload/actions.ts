import { Dispatch } from 'redux'

import Server from '../../server/server'
import { AddError } from '../errors/action.types'
import { recordError } from '../errors/actions'

/**
 * Upload the specified file to the server. Return a relative url that can be used to retrieve the file.
 * Dispatch an error for any unexpected server response
 * Note: this does not affect the redux store unless there is an error.
 * @param file the file to upload
 */
export const upload = (file: Blob) => (dispatch: Dispatch<AddError>) =>
    Server.upload(file)
        .catch(err => recordError(err)(dispatch))
