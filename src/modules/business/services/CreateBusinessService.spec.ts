import AppError from '@shared/error/AppError';
import FakeAuthProvider from '@shared/provider/AuthProvider/fakes/FakeAuthProvider';
import FakeStorageProvider from '@shared/provider/StorageProvider/fakes/FakeStorageProvider';
import FakeTaxIdProvider from '@shared/provider/TaxIdProvider/fakes/FakeTaxIdProvider';
import FakeBusinessRepository from '../repositories/fakes/FakeBusinessRepository';
import CreateBusinessService from './CreateBusinessService';

let fakeBusinessRepository: FakeBusinessRepository;
let fakeTaxIdProvider: FakeTaxIdProvider;
let fakeAuthProvider: FakeAuthProvider;
let fakeStorageProvider: FakeStorageProvider;
let createBusinessService: CreateBusinessService;

describe('CreateBusiness', () => {
  beforeEach(() => {
    fakeBusinessRepository = new FakeBusinessRepository();
    fakeTaxIdProvider = new FakeTaxIdProvider();
    fakeAuthProvider = new FakeAuthProvider();
    fakeStorageProvider = new FakeStorageProvider();
    createBusinessService = new CreateBusinessService(
      fakeBusinessRepository,
      fakeTaxIdProvider,
      fakeAuthProvider,
      fakeStorageProvider,
    );
  });

  it('should be able to create a new business', async () => {
    const saveFile = jest.spyOn(fakeStorageProvider, 'saveFile');

    const business = await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      cell_phone: '19999990999',
      phone: '1933330333',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
      avatar: 'avatar.jpg',
    });

    expect(business).toHaveProperty('token');
    expect(business).toHaveProperty('business');
    expect(saveFile).toHaveBeenCalledWith('avatar.jpg');
  });

  it('should be able to create a new business without the avatar.', async () => {
    const business = await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      cell_phone: '19999999999',
      phone: '1933333333',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    expect(business).toHaveProperty('token');
    expect(business).toHaveProperty('business');
  });

  it('should be able to create a new business without informing cell phone, phone or complement', async () => {
    const business = await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    expect(business).toHaveProperty('token');
    expect(business).toHaveProperty('business');
  });

  it('should be able to create a new business with cpf already registered at another his', async () => {
    await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      cell_phone: '19999999996',
      phone: '1933333333',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    const business = await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business Two',
      categories: 'bares',
      cell_phone: '19999999997',
      phone: '1933333332',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    expect(business).toHaveProperty('token');
    expect(business).toHaveProperty('business');
  });

  it('should not be able to create a new business with mare than 4 categories', async () => {
    await expect(
      createBusinessService.execute({
        user_id: 'user-id',
        name: 'New Business',
        categories: 'bar one, bar two, bar three, bar four, bar five',
        cell_phone: '19999999999',
        phone: '1933333333',
        taxId: '889.786.230-69',
        zip_code: '99999-999',
        number: 9,
        complement: 'Complement Test',
        street: 'Rua test',
        neighborhood: 'Neighborhood Test',
        city: 'City Test',
        state: 'State Test',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new business with name already registered', async () => {
    await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      cell_phone: '19999999999',
      phone: '1933333333',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    await expect(
      createBusinessService.execute({
        user_id: 'user-id',
        name: 'New Business',
        categories: 'bares',
        cell_phone: '19999999999',
        phone: '1933333333',
        taxId: '889.786.230-69',
        zip_code: '99999-999',
        number: 9,
        complement: 'Complement Test',
        street: 'Rua test',
        neighborhood: 'Neighborhood Test',
        city: 'City Test',
        state: 'State Test',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new business with cell phone already registered for another user', async () => {
    await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      cell_phone: '(19) 99999-9999',
      phone: '1933333333',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    await expect(
      createBusinessService.execute({
        user_id: 'other-user-id',
        name: 'New Business Two',
        categories: 'bares',
        cell_phone: '19999999999',
        phone: '1933333333',
        taxId: '889.786.230-69',
        zip_code: '99999-999',
        number: 9,
        complement: 'Complement Test',
        street: 'Rua test',
        neighborhood: 'Neighborhood Test',
        city: 'City Test',
        state: 'State Test',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new business with phone already registered for another user', async () => {
    await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      cell_phone: '19999999996',
      phone: '1933333333',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    await expect(
      createBusinessService.execute({
        user_id: 'other-user-id',
        name: 'New Business Two',
        categories: 'bares',
        cell_phone: '19999999997',
        phone: '1933333333',
        taxId: '889.786.230-69',
        zip_code: '99999-999',
        number: 9,
        complement: 'Complement Test',
        street: 'Rua test',
        neighborhood: 'Neighborhood Test',
        city: 'City Test',
        state: 'State Test',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new business with invalid taxId', async () => {
    await expect(
      createBusinessService.execute({
        user_id: 'user-id',
        name: 'New Business',
        categories: 'bares',
        cell_phone: '19999999996',
        phone: '1933333333',
        taxId: 'invalid-taxId',
        zip_code: '99999-999',
        number: 9,
        complement: 'Complement Test',
        street: 'Rua test',
        neighborhood: 'Neighborhood Test',
        city: 'City Test',
        state: 'State Test',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new business with cpf already registered for another user', async () => {
    await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      cell_phone: '19999999996',
      phone: '1933333333',
      taxId: '889.786.230-69',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    await expect(
      createBusinessService.execute({
        user_id: 'outher-user-id',
        name: 'New Business Two',
        categories: 'bares',
        cell_phone: '19999999997',
        phone: '1933333332',
        taxId: '889.786.230-69',
        zip_code: '99999-999',
        number: 9,
        complement: 'Complement Test',
        street: 'Rua test',
        neighborhood: 'Neighborhood Test',
        city: 'City Test',
        state: 'State Test',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a new business with cpnj already registered for another business', async () => {
    await createBusinessService.execute({
      user_id: 'user-id',
      name: 'New Business',
      categories: 'bares',
      cell_phone: '19999999996',
      phone: '1933333333',
      taxId: '51874860073230',
      zip_code: '99999-999',
      number: 9,
      complement: 'Complement Test',
      street: 'Rua test',
      neighborhood: 'Neighborhood Test',
      city: 'City Test',
      state: 'State Test',
    });

    await expect(
      createBusinessService.execute({
        user_id: 'outher-user-id',
        name: 'New Business Two',
        categories: 'bares',
        cell_phone: '19999999997',
        phone: '1933333332',
        taxId: '51874860073230',
        zip_code: '99999-999',
        number: 9,
        complement: 'Complement Test',
        street: 'Rua test',
        neighborhood: 'Neighborhood Test',
        city: 'City Test',
        state: 'State Test',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
