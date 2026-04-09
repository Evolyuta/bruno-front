import React, { useEffect, useCallback, useRef } from 'react';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { savePreferences } from 'providers/ReduxStore/slices/app';
import StyledWrapper from './StyledWrapper';
import * as Yup from 'yup';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
import { CUSTOM_FEATURES_META } from 'utils/custom-features';
import get from 'lodash/get';

const Extensions = ({ close }) => {
  const preferences = useSelector((state) => state.app.preferences);
  const dispatch = useDispatch();

  const generateValidationSchema = () => {
    const schemaShape = {};
    CUSTOM_FEATURES_META.forEach((feature) => {
      schemaShape[feature.id] = Yup.boolean();
    });
    return Yup.object().shape(schemaShape);
  };

  const generateInitialValues = () => {
    const initialValues = {};
    CUSTOM_FEATURES_META.forEach((feature) => {
      // All features enabled by default
      initialValues[feature.id] = get(preferences, `customFeatures.${feature.id}`, true);
    });
    return initialValues;
  };

  const schema = generateValidationSchema();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: generateInitialValues(),
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const newPreferences = await schema.validate(values, { abortEarly: true });
        handleSave(newPreferences);
      } catch (error) {
        console.error('Extensions preferences validation error:', error.message);
      }
    }
  });

  const handleSave = useCallback((newCustomFeatures) => {
    dispatch(
      savePreferences({
        ...preferences,
        customFeatures: {
          ...preferences.customFeatures,
          ...newCustomFeatures
        }
      })
    )
      .catch(() => toast.error('Failed to update extension preferences'));
  }, [dispatch, preferences]);

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  const debouncedSave = useCallback(
    debounce((values) => {
      schema.validate(values, { abortEarly: true })
        .then((validatedValues) => {
          handleSaveRef.current(validatedValues);
        })
        .catch(() => {});
    }, 500),
    [schema]
  );

  useEffect(() => {
    if (formik.dirty && formik.isValid) {
      debouncedSave(formik.values);
    }
    return () => {
      debouncedSave.flush();
    };
  }, [formik.values, formik.dirty, formik.isValid, debouncedSave]);

  return (
    <StyledWrapper>
      <div className="section-header">Custom Extensions</div>
      <form onSubmit={formik.handleSubmit}>
        <p className="text-gray-500 dark:text-gray-400 mb-4 text-xs">
          Toggle custom features on or off. All features are enabled by default.
        </p>

        <div>
          {CUSTOM_FEATURES_META.map((feature) => (
            <div key={feature.id} className="feature-item">
              <div className="flex items-center">
                <input
                  id={feature.id}
                  type="checkbox"
                  name={feature.id}
                  checked={formik.values[feature.id]}
                  onChange={formik.handleChange}
                  className="mousetrap mr-0"
                />
                <label className="block ml-2 select-none font-medium text-sm" htmlFor={feature.id}>
                  {feature.label}
                </label>
              </div>
              <div className="feature-description ml-6 text-xs text-gray-500 dark:text-gray-400">
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </form>
    </StyledWrapper>
  );
};

export default Extensions;
